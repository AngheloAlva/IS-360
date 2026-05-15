"use server"

import { headers } from "next/headers"

import { sendApproveMilestoneEmail, sendRejectMilestoneEmail } from "./send-close-milestone"
import { sendApproveClosureEmail } from "@/project/work-order/actions/sendApproveEmail"
import { acquireWorkOrderLock } from "@/project/work-order/lib/concurrency"
import { computeProgress } from "@/project/work-order/lib/progress"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface RequestCloseMilestoneResponse {
	ok: boolean
	message: string
}

interface RequestCloseMilestoneParams {
	milestoneId: string
	closureComment?: string
}

export async function approveMilestone({
	milestoneId,
	closureComment,
}: RequestCloseMilestoneParams): Promise<RequestCloseMilestoneResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const milestone = await prisma.milestone.findUnique({
			where: { id: milestoneId },
			select: {
				name: true,
				weight: true,
				status: true,
				workOrder: {
					select: {
						id: true,
						otNumber: true,
						progress: true,
						status: true,
						workBookName: true,
						responsible: {
							select: {
								email: true,
							},
						},
						supervisor: {
							select: {
								email: true,
							},
						},
						company: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		})

		if (!milestone) {
			return {
				ok: false,
				message: "El hito no existe",
			}
		}

		if (milestone.status === "COMPLETED") {
			return {
				ok: false,
				message: "El hito ya fue aprobado",
			}
		}

		const txResult = await prisma.$transaction(async (tx) => {
			// SPEC-003: acquire per-workOrder advisory lock — first operation in TX
			await acquireWorkOrderLock(tx, milestone.workOrder.id)

			// SPEC-001.3 / Design §3.4: TOCTOU mitigation — re-read OT status inside TX after lock
			const currentWo = await tx.workOrder.findUnique({
				where: { id: milestone.workOrder.id },
				select: { status: true },
			})
			if (currentWo?.status === "COMPLETED") {
				throw new Error("La OT ya está cerrada. No se pueden aprobar hitos.")
			}

			const updatedMilestone = await tx.milestone.update({
				where: { id: milestoneId },
				data: {
					closureComment,
					status: "COMPLETED",
					approvedAt: new Date(),
					approvedBy: {
						connect: {
							id: session.user.id,
						},
					},
				},
			})

			// SPEC-004: float-safe progress calculation
			const completed = await tx.milestone.findMany({
				where: { workOrderId: milestone.workOrder.id, status: "COMPLETED" },
				select: { weight: true },
			})
			const total = await tx.milestone.count({ where: { workOrderId: milestone.workOrder.id } })

			const progress = computeProgress(completed.map((c) => c.weight ?? 0))

			// SPEC-001: status was already re-checked under lock above (TOCTOU mitigation)
			const shouldAutoClose = total > 0 && completed.length === total && progress === 100

			let updatedWorkOrder
			if (shouldAutoClose) {
				// SPEC-001: set COMPLETED + endDate + progress 100 in same TX
				updatedWorkOrder = await tx.workOrder.update({
					where: { id: milestone.workOrder.id },
					data: {
						status: "COMPLETED",
						endDate: new Date(),
						progress: 100,
					},
				})
			} else {
				updatedWorkOrder = await tx.workOrder.update({
					where: { id: milestone.workOrder.id },
					data: { progress },
				})
			}

			return {
				updatedMilestone,
				updatedWorkOrder,
				shouldAutoClose,
				progress,
			}
		})

		const { updatedMilestone, updatedWorkOrder, shouldAutoClose, progress } = txResult

		// Post-commit: activity log for milestone approval (existing behavior)
		await logActivity({
			userId: session.user.id,
			module: MODULES.WORK_ORDERS,
			action: ACTIVITY_TYPE.APPROVE,
			entityId: milestoneId,
			entityType: "Milestone",
			metadata: {
				name: milestone.name,
				weight: milestone.weight,
				workOrderId: milestone.workOrder.id,
				otNumber: milestone.workOrder.otNumber,
				progress: updatedWorkOrder.progress,
				closureComment,
				status: updatedMilestone.status,
				approvedAt: updatedMilestone.approvedAt,
			},
		})

		// Post-commit: auto-close side effects (SPEC-005, SPEC-006)
		if (shouldAutoClose) {
			// SPEC-006: activity log for OT auto-close
			await logActivity({
				userId: session.user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.UPDATE,
				entityId: milestone.workOrder.id,
				entityType: "WorkOrder",
				metadata: {
					workOrderId: milestone.workOrder.id,
					otNumber: milestone.workOrder.otNumber,
					finalProgress: 100,
					autoClosed: true,
					triggeringMilestoneId: milestoneId,
				},
			})

			// SPEC-005: single email covers both events (milestone approved + OT auto-closed)
			if (milestone.workOrder.supervisor?.email) {
				try {
					await sendApproveClosureEmail({
						email: milestone.workOrder.supervisor.email,
						workOrderNumber: milestone.workOrder.otNumber,
						workOrderName: milestone.workOrder.workBookName || "",
						companyName: milestone.workOrder.company?.name || "Interno",
						supervisorName: session.user.name || "",
						autoClosed: true,
						milestoneName: milestone.name,
						milestoneComment: closureComment,
					})
				} catch (err) {
					console.error("[auto-close] email failed", {
						workOrderId: milestone.workOrder.id,
						err,
					})
				}
			} else {
				console.warn("[auto-close] supervisor email missing — notification skipped", {
					workOrderId: milestone.workOrder.id,
					otNumber: milestone.workOrder.otNumber,
				})
			}
		} else {
			// Existing behavior: send milestone approval email
			await sendApproveMilestoneEmail({
				comment: closureComment,
				milestoneName: milestone.name,
				otNumber: milestone.workOrder.otNumber,
				supervisorEmail: milestone.workOrder.supervisor.email,
			})
		}

		return {
			ok: true,
			message: shouldAutoClose
				? "Hito cerrado correctamente. La OT se cerró automáticamente."
				: "Hito cerrado correctamente",
		}
	} catch (error) {
		console.error("Error al guardar los hitos:", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al guardar los hitos",
		}
	}
}

export async function rejectMilestone({
	milestoneId,
	closureComment,
}: RequestCloseMilestoneParams): Promise<RequestCloseMilestoneResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const milestone = await prisma.milestone.findUnique({
			where: { id: milestoneId },
			select: {
				name: true,
				weight: true,
				status: true,
				workOrder: {
					select: {
						id: true,
						otNumber: true,
						progress: true,
						status: true,
						responsible: {
							select: {
								email: true,
							},
						},
						supervisor: {
							select: {
								email: true,
							},
						},
					},
				},
			},
		})

		if (!milestone) {
			return {
				ok: false,
				message: "El hito no existe",
			}
		}

		// SPEC-002, Design §3.4: pre-TX short-circuit guard
		if (milestone.workOrder.status === "COMPLETED") {
			return {
				ok: false,
				message: "La OT ya está cerrada. No se pueden rechazar hitos.",
			}
		}

		const [updatedMilestone, updatedWorkOrder] = await prisma.$transaction(async (tx) => {
			// SPEC-003: advisory lock — first operation in TX
			await acquireWorkOrderLock(tx, milestone.workOrder.id)

			// SPEC-002, Design §3.4: TOCTOU mitigation — re-check status inside TX after lock
			const currentWo = await tx.workOrder.findUnique({
				where: { id: milestone.workOrder.id },
				select: { status: true },
			})
			if (currentWo?.status === "COMPLETED") {
				throw new Error("La OT ya está cerrada. No se pueden rechazar hitos.")
			}

			const m = await tx.milestone.update({
				where: { id: milestoneId },
				data: {
					closureComment,
					status: "IN_PROGRESS",
					approvedAt: new Date(),
					approvedBy: {
						connect: {
							id: session.user.id,
						},
					},
				},
			})

			// SPEC-004: float-safe progress recalculation after rejection
			const completed = await tx.milestone.findMany({
				where: { workOrderId: milestone.workOrder.id, status: "COMPLETED" },
				select: { weight: true },
			})
			const progress = computeProgress(completed.map((c) => c.weight ?? 0))

			// SPEC-002: NO auto-reopen, NO status change — only recalc progress
			const wo = await tx.workOrder.update({
				where: { id: milestone.workOrder.id },
				data: { progress },
			})

			return [m, wo] as const
		})

		await logActivity({
			userId: session.user.id,
			module: MODULES.WORK_ORDERS,
			action: ACTIVITY_TYPE.REJECT,
			entityId: milestoneId,
			entityType: "Milestone",
			metadata: {
				name: milestone.name,
				weight: milestone.weight,
				workOrderId: milestone.workOrder.id,
				otNumber: milestone.workOrder.otNumber,
				progress: updatedWorkOrder.progress,
				closureComment,
				status: updatedMilestone.status,
				approvedAt: updatedMilestone.approvedAt,
			},
		})

		await sendRejectMilestoneEmail({
			comment: closureComment,
			milestoneName: milestone.name,
			otNumber: milestone.workOrder.otNumber,
			supervisorEmail: milestone.workOrder.supervisor.email,
		})

		return {
			ok: true,
			message: "Hito rechazado correctamente",
		}
	} catch (error) {
		console.error("Error al guardar los hitos:", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al guardar los hitos",
		}
	}
}
