"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/lib/prisma"

import type { UpdateWorkOrderSchema } from "@/lib/form-schemas/admin/work-order/updateWorkOrder.schema"

interface UpdateWorkOrderParams {
	id: string
	values: UpdateWorkOrderSchema
}

export const updateWorkOrderById = async ({ id, values }: UpdateWorkOrderParams) => {
	try {
		const workOrder = await prisma.workOrder.update({
			where: {
				id,
			},
			data: {
				type: values.type,
				status: values.status,
				solicitationDate: values.solicitationDate,
				solicitationTime: values.solicitationTime,
				workRequest: values.workRequest,
				workDescription: values.workDescription,
				priority: values.priority,
				capex: values.capex,
				programDate: values.programDate,
				estimatedHours: parseInt(values.estimatedHours),
				estimatedDays: parseInt(values.estimatedDays),
				requiresBreak: values.requiresBreak,
				breakDays: values.breakDays ? parseInt(values.breakDays) : undefined,
				estimatedEndDate: values.estimatedEndDate,
				workProgressStatus: +values.workProgressStatus,
				company: {
					connect: {
						id: values.companyId,
					},
				},
				supervisor: {
					connect: {
						id: values.supervisorId,
					},
				},
				responsible: {
					connect: {
						id: values.responsibleId,
					},
				},
				equipment: {
					set: values.equipment.map((id) => ({ id })),
				},
			},
		})

		revalidatePath("/admin/dashboard/ordenes-de-trabajo")

		return {
			ok: true,
			data: workOrder,
			message: "Orden de trabajo actualizada exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al actualizar la orden de trabajo",
		}
	}
}
