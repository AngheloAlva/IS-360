"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import { sendApproveMilestoneEmail, sendRejectMilestoneEmail } from "./send-close-milestone"
import prisma from "@/lib/prisma"

interface RequestCloseMilestoneResponse {
	ok: boolean
	message: string
}

interface RequestCloseMilestoneParams {
	userId: string
	milestoneId: string
	closureComment?: string
}

export async function approveMilestone({
	userId,
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
				workOrder: {
					select: {
						id: true,
						otNumber: true,
						progress: true,
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

		const updatedMilestone = await prisma.milestone.update({
			where: { id: milestoneId },
			data: {
				closureComment,
				status: "COMPLETED",
				approvedAt: new Date(),
				approvedBy: {
					connect: {
						id: userId,
					},
				},
			},
		})

		const updatedWorkOrder = await prisma.workOrder.update({
			where: { id: milestone.workOrder.id },
			data: {
				progress: (milestone.workOrder.progress || 0) + milestone.weight,
			},
		})

		logActivity({
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

		sendApproveMilestoneEmail({
			comment: closureComment,
			milestoneName: milestone.name,
			otNumber: milestone.workOrder.otNumber,
			supervisorEmail: milestone.workOrder.supervisor.email,
		})

		return {
			ok: true,
			message: "Hito cerrado correctamente",
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
	userId,
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
				workOrder: {
					select: {
						id: true,
						otNumber: true,
						progress: true,
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

		const updatedMilestone = await prisma.milestone.update({
			where: { id: milestoneId },
			data: {
				closureComment,
				status: "IN_PROGRESS",
				approvedAt: new Date(),
				approvedBy: {
					connect: {
						id: userId,
					},
				},
			},
		})

		const updatedWorkOrder = await prisma.workOrder.update({
			where: { id: milestone.workOrder.id },
			data: {
				progress: milestone.workOrder.progress! - milestone.weight,
			},
		})

		logActivity({
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

		sendRejectMilestoneEmail({
			comment: closureComment,
			milestoneName: milestone.name,
			otNumber: milestone.workOrder.otNumber,
			supervisorEmail: milestone.workOrder.supervisor.email,
		})

		return {
			ok: true,
			message: "Hito cerrado correctamente",
		}
	} catch (error) {
		console.error("Error al guardar los hitos:", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al guardar los hitos",
		}
	}
}
