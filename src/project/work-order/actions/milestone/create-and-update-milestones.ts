"use server"

import { headers } from "next/headers"

import { sendNotification } from "@/shared/actions/notifications/send-notification"
import { ACTIVITY_TYPE, MILESTONE_STATUS, MODULES } from "@prisma/client"
import { sendMilestoneUpdateEmail } from "./sendMilestoneUpdateEmail"
import { logActivity } from "@/lib/activity/log"
import { USER_ROLE } from "@/lib/permissions"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { WorkBookMilestonesSchema } from "@/project/work-order/schemas/milestones.schema"

interface SaveMilestonesResponse {
	ok: boolean
	message: string
}

export async function createAndUpdateMilestones(
	values: WorkBookMilestonesSchema
): Promise<SaveMilestonesResponse> {
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
		const workOrder = await prisma.workOrder.findUnique({
			where: { id: values.workOrderId },
			select: {
				id: true,
				otNumber: true,
				workName: true,
				milestones: true,
				responsible: true,
				supervisor: true,
				company: {
					select: {
						id: true,
						name: true,
						rut: true,
					},
				},
			},
		})

		if (!workOrder) {
			return {
				ok: false,
				message: "El libro de obras no existe",
			}
		}

		const createdAndUpdatedMilestones = []
		for (const [index, milestone] of values.milestones.entries()) {
			const existingMilestone = workOrder.milestones.find((m) => m.id === milestone.id)

			if (existingMilestone) {
				await prisma.milestone.update({
					where: { id: existingMilestone.id },
					data: {
						order: index,
						isCompleted: false,
						name: milestone.name,
						endDate: milestone.endDate,
						startDate: milestone.startDate,
						weight: Number(milestone.weight),
						status: MILESTONE_STATUS.PENDING,
						description: milestone.description || "",
					},
				})

				createdAndUpdatedMilestones.push(existingMilestone)
				continue
			}

			const createdMilestone = await prisma.milestone.create({
				data: {
					order: index,
					isCompleted: false,
					name: milestone.name,
					endDate: milestone.endDate,
					startDate: milestone.startDate,
					weight: Number(milestone.weight),
					status: MILESTONE_STATUS.PENDING,
					description: milestone.description || "",
					workOrder: {
						connect: { id: values.workOrderId },
					},
				},
			})
			createdAndUpdatedMilestones.push(createdMilestone)
		}

		sendNotification({
			type: "milestone",
			creatorId: session.user.id,
			title: "Actualización de hitos",
			link: `/admin/dashboard/ordenes-de-trabajo/${workOrder.id}`,
			targetRoles: [USER_ROLE.admin, USER_ROLE.workOrderOperator],
			message: `Se han actualizado los hitos del libro de obras ${workOrder.workName}`,
		})

		if (workOrder.responsible.email) {
			await sendMilestoneUpdateEmail({
				workOrderId: workOrder.id,
				email: workOrder.responsible.email,
				workOrderNumber: workOrder.otNumber,
				supervisorName: workOrder.supervisor.name + workOrder.supervisor.rut,
				workOrderName: workOrder.workName || `Libro de Obras ${workOrder.otNumber}`,
				companyName: workOrder.company
					? workOrder.company.name + " - " + workOrder.company.rut
					: "Interno",
				milestonesCount: values.milestones.length,
				updateDate: new Date(),
			})
		}

		logActivity({
			userId: session.user.id,
			module: MODULES.WORK_ORDERS,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: values.workOrderId,
			entityType: "Milestone",
			metadata: {
				workOrderId: values.workOrderId,
				milestones: createdAndUpdatedMilestones.map((m) => ({
					id: m.id,
					name: m.name,
					description: m.description,
					weight: m.weight,
					startDate: m.startDate,
					endDate: m.endDate,
					order: m.order,
				})),
			},
		})

		return {
			ok: true,
			message: "Hitos guardados correctamente",
		}
	} catch (error) {
		console.error("Error al guardar los hitos:", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al guardar los hitos",
		}
	}
}
