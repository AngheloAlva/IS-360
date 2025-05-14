"use server"

import prisma from "@/lib/prisma"
import { sendRequestCloseMilestoneEmail } from "./send-close-milestone"

interface RequestCloseMilestoneResponse {
	ok: boolean
	message: string
}

interface RequestCloseMilestoneParams {
	userId: string
	milestoneId: string
}

export async function requestCloseMilestone({
	userId,
	milestoneId,
}: RequestCloseMilestoneParams): Promise<RequestCloseMilestoneResponse> {
	try {
		const milestone = await prisma.milestone.findUnique({
			where: { id: milestoneId },
			select: {
				name: true,
				weight: true,
				description: true,
				workOrderId: true,
				workOrder: {
					select: {
						otNumber: true,
						workName: true,
						workDescription: true,
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
				requestedBy: {
					connect: {
						id: userId,
					},
				},
				isCompleted: true,
				status: "REQUESTED_CLOSURE",
			},
		})

		sendRequestCloseMilestoneEmail({
			milestone,
			responsibleEmail: milestone.workOrder.responsible.email,
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
