"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { WorkBookSchema } from "@/project/work-order/schemas/work-book.schema"

interface UpdateWorkOrderLikeBook {
	id: string
	values: WorkBookSchema
}

export const updateWorkOrderLikeBook = async ({ id, values }: UpdateWorkOrderLikeBook) => {
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
		const updatedWorkOrder = await prisma.workOrder.update({
			where: {
				id,
			},
			data: {
				isWorkBookInit: true,
				workBookName: values.workBookName,
				workBookLocation: values.workBookLocation,
				workBookStartDate: values.workBookStartDate,
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.WORK_ORDERS,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: id,
			entityType: "WorkOrder",
			metadata: {
				isWorkBookInit: updatedWorkOrder.isWorkBookInit,
				workBookName: updatedWorkOrder.workBookName,
				workBookLocation: updatedWorkOrder.workBookLocation,
				workBookStartDate: updatedWorkOrder.workBookStartDate,
			},
		})

		return {
			ok: true,
			message: "Libro de obras actualizado exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al actualizar el libro de obras",
		}
	}
}
