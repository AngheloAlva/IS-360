"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES, WORK_ORDER_STATUS } from "@prisma/client"
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
				permission: {
					workOrder: ["update"],
				},
			},
		})

		if (!hasPermission) {
			throw new Error("No tienes permisos para cerrar órdenes de trabajo")
		}

		const workOrders = await prisma.workOrder.findMany({
			where: {
				id: { in: workOrderIds },
				status: {
					notIn: [WORK_ORDER_STATUS.COMPLETED],
				},
			},
			select: { id: true, otNumber: true, status: true },
		})

		if (workOrders.length === 0) {
			throw new Error("No se encontraron órdenes de trabajo válidas para cerrar")
		}

		const result = await prisma.workOrder.updateMany({
			where: {
				id: { in: workOrders.map((wo: { id: string }) => wo.id) },
			},
			data: {
				progress: 100,
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
