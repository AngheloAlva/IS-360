"use server"

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
						workProgressStatus: true,
						responsible: {
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

		await prisma.milestone.update({
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

		await prisma.workOrder.update({
			where: { id: milestone.workOrder.id },
			data: {
				workProgressStatus: (milestone.workOrder.workProgressStatus || 0) + milestone.weight,
			},
		})

		sendApproveMilestoneEmail({
			comment: closureComment,
			milestoneName: milestone.name,
			otNumber: milestone.workOrder.otNumber,
			supervisorEmail: milestone.workOrder.responsible.email,
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
						workProgressStatus: true,
						responsible: {
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

		await prisma.milestone.update({
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

		await prisma.workOrder.update({
			where: { id: milestone.workOrder.id },
			data: {
				workProgressStatus: milestone.workOrder.workProgressStatus! - milestone.weight,
			},
		})

		sendRejectMilestoneEmail({
			comment: closureComment,
			milestoneName: milestone.name,
			otNumber: milestone.workOrder.otNumber,
			supervisorEmail: milestone.workOrder.responsible.email,
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
