"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { WorkBookMilestonesSchema } from "@/project/work-order/schemas/milestones.schema"

interface SaveMilestonesResponse {
	ok: boolean
	message: string
}

export async function createMilestones(
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
			include: { milestones: true },
		})

		if (!workOrder) {
			return {
				ok: false,
				message: "El libro de obras no existe",
			}
		}

		const createdMilestones = []
		for (const [index, milestone] of values.milestones.entries()) {
			const createdMilestone = await prisma.milestone.create({
				data: {
					name: milestone.name,
					description: milestone.description || "",
					order: index,
					isCompleted: false,
					weight: Number(milestone.weight),
					startDate: milestone.startDate,
					endDate: milestone.endDate,
					workOrder: {
						connect: { id: values.workOrderId },
					},
				},
			})
			createdMilestones.push(createdMilestone)
		}

		logActivity({
			userId: session.user.id,
			module: MODULES.WORK_ORDERS,
			action: ACTIVITY_TYPE.CREATE,
			entityId: values.workOrderId,
			entityType: "Milestone",
			metadata: {
				workOrderId: values.workOrderId,
				milestones: createdMilestones.map((m) => ({
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

		revalidatePath(`/dashboard/libro-de-obras/${values.workOrderId}`)

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
