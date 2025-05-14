"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/lib/prisma"

import type { WorkBookMilestonesSchema } from "@/lib/form-schemas/work-book/milestones.schema"

interface SaveMilestonesResponse {
	ok: boolean
	message: string
}

export async function createMilestones(
	values: WorkBookMilestonesSchema
): Promise<SaveMilestonesResponse> {
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

		for (const [index, milestone] of values.milestones.entries()) {
			await prisma.milestone.create({
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
		}

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
