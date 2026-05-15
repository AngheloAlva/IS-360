"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface DeleteWorkOrderProps {
	workOrderId: string
}

export const deleteWorkOrder = async ({ workOrderId }: DeleteWorkOrderProps) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return { ok: false, message: "No autorizado" }
	}

	const permission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions: {
				workOrder: ["delete-empty"],
			},
		},
	})

	if (!permission.success) {
		return { ok: false, message: "No tienes permiso para eliminar órdenes de trabajo" }
	}

	try {
		const workOrder = await prisma.workOrder.findUnique({
			where: { id: workOrderId },
			select: {
				id: true,
				otNumber: true,
				type: true,
				status: true,
				priority: true,
				deletedAt: true,
				supervisorId: true,
				responsibleId: true,
				companyId: true,
				_count: {
					select: {
						milestones: true,
						workBookEntries: true,
					},
				},
			},
		})

		if (!workOrder) {
			return { ok: false, message: "Orden de trabajo no encontrada" }
		}

		if (workOrder.deletedAt) {
			return { ok: false, message: "La orden de trabajo ya fue eliminada" }
		}

		if (workOrder.status !== "PLANNED" && workOrder.status !== "PENDING") {
			return {
				ok: false,
				message: "Solo se pueden eliminar órdenes en estado Planificada o Pendiente",
			}
		}

		if (workOrder._count.milestones > 0 || workOrder._count.workBookEntries > 0) {
			return {
				ok: false,
				message:
					"Solo se pueden eliminar órdenes sin hitos, actividades diarias ni inspecciones",
			}
		}

		await prisma.workOrder.update({
			where: { id: workOrderId },
			data: {
				deletedAt: new Date(),
				deletedById: session.user.id,
			},
		})

		await logActivity({
			userId: session.user.id,
			module: MODULES.WORK_ORDERS,
			action: ACTIVITY_TYPE.DELETE,
			entityId: workOrder.id,
			entityType: "WorkOrder",
			changesBefore: {
				otNumber: workOrder.otNumber,
				type: workOrder.type,
				status: workOrder.status,
				priority: workOrder.priority,
				supervisorId: workOrder.supervisorId,
				responsibleId: workOrder.responsibleId,
				companyId: workOrder.companyId,
			},
			metadata: {
				otNumber: workOrder.otNumber,
				reason: "soft-delete (delete-empty)",
			},
		})

		revalidatePath("/admin/dashboard/ordenes-de-trabajo")

		return { ok: true, message: "Orden de trabajo eliminada exitosamente" }
	} catch (error) {
		console.error("[DELETE_WORK_ORDER]", error)
		return { ok: false, message: "Error al eliminar la orden de trabajo" }
	}
}
