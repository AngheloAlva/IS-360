"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES, WORK_ORDER_STATUS } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface BulkCloseWorkOrdersParams {
	workOrderIds: string[]
	reason?: string
}

export async function bulkCloseWorkOrders({ workOrderIds, reason }: BulkCloseWorkOrdersParams) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})
		if (!session?.user) {
			throw new Error("No autorizado")
		}

		const hasPermission = await auth.api.userHasPermission({
			body: {
				userId: session.user.id,
				permission: {
					workOrder: ["update"],
				},
			},
		})

		if (!hasPermission) {
			throw new Error("No tienes permisos para cerrar órdenes de trabajo")
		}

		const allSelected = await prisma.workOrder.findMany({
			where: { id: { in: workOrderIds }, deletedAt: null },
			select: { id: true, otNumber: true, status: true },
		})

		const workOrders = allSelected.filter(
			(wo) => wo.status !== WORK_ORDER_STATUS.COMPLETED
		)

		if (workOrders.length === 0) {
			if (allSelected.length > 0 && allSelected.every((wo) => wo.status === WORK_ORDER_STATUS.COMPLETED)) {
				throw new Error("Las órdenes de trabajo seleccionadas ya están cerradas")
			}
			throw new Error("No se encontraron órdenes de trabajo válidas para cerrar")
		}

		const result = await prisma.workOrder.updateMany({
			where: {
				id: { in: workOrders.map((wo: { id: string }) => wo.id) },
			},
			data: {
				progress: 100,
				endDate: new Date(),
				status: WORK_ORDER_STATUS.COMPLETED,
				closureRejectedReason: reason || null,
			},
		})

		await Promise.all(
			workOrders.map((wo: { id: string }) =>
				logActivity({
					action: ACTIVITY_TYPE.UPDATE,
					userId: session.user.id,
					module: MODULES.WORK_ORDERS,
					entityId: wo.id,
					entityType: "WORK_ORDER",
					metadata: {
						workOrder: wo,
						reason: reason || "No especificado",
					},
				})
			)
		)

		return {
			ok: true,
			message: `Se cerraron exitosamente ${result.count} órdenes de trabajo`,
		}
	} catch (error) {
		console.error("[BULK_CLOSE_WORK_ORDERS]", error)
		throw new Error(error instanceof Error ? error.message : "Error al cerrar órdenes de trabajo")
	}
}
