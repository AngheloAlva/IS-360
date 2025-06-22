"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
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

		const updatedMilestone = await prisma.milestone.update({
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

		logActivity({
			userId: session.user.id,
			module: MODULES.WORK_ORDERS,
			action: ACTIVITY_TYPE.SUBMIT,
			entityId: milestoneId,
			entityType: "Milestone",
			metadata: {
				name: milestone.name,
				weight: milestone.weight,
				description: milestone.description,
				workOrderId: milestone.workOrderId,
				otNumber: milestone.workOrder.otNumber,
				workName: milestone.workOrder.workName,
				workDescription: milestone.workOrder.workDescription,
				workProgressStatus: milestone.workOrder.workProgressStatus,
				status: updatedMilestone.status,
				isCompleted: updatedMilestone.isCompleted,
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
