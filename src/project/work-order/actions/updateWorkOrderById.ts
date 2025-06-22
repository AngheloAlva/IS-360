"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { UpdateWorkOrderSchema } from "@/project/work-order/schemas/updateWorkOrder.schema"

interface UpdateWorkOrderParams {
	id: string
	values: UpdateWorkOrderSchema
}

interface UpdateWorkOrderResponse {
	ok: boolean
	message?: string
}

export const updateWorkOrderById = async ({
	id,
	values,
}: UpdateWorkOrderParams): Promise<UpdateWorkOrderResponse> => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				workOrder: ["update"],
			},
		},
	})

	if (!hasPermission.success) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const workOrder = await prisma.workOrder.update({
			include: {
				company: true,
				supervisor: true,
				responsible: true,
				equipment: true,
			},
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

		logActivity({
			userId: session.user.id,
			module: MODULES.WORK_ORDERS,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: id,
			entityType: "WorkOrder",
			metadata: {
				type: workOrder.type,
				status: workOrder.status,
				solicitationDate: workOrder.solicitationDate,
				solicitationTime: workOrder.solicitationTime,
				workRequest: workOrder.workRequest,
				workDescription: workOrder.workDescription,
				priority: workOrder.priority,
				capex: workOrder.capex,
				programDate: workOrder.programDate,
				estimatedHours: workOrder.estimatedHours,
				estimatedDays: workOrder.estimatedDays,
				requiresBreak: workOrder.requiresBreak,
				breakDays: workOrder.breakDays,
				estimatedEndDate: workOrder.estimatedEndDate,
				workProgressStatus: workOrder.workProgressStatus,
				companyId: workOrder.company?.id,
				supervisorId: workOrder.supervisor?.id,
				responsibleId: workOrder.responsible?.id,
				equipmentCount: workOrder.equipment?.length || 0,
			},
		})

		revalidatePath("/admin/dashboard/ordenes-de-trabajo")

		return {
			ok: true,
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
