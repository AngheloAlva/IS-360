"use server"

import { headers } from "next/headers"

import { sendRejectClosureEmail } from "./sendRejectClosure"
import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface RejectClosureProps {
	userId: string
	reason?: string
	workBookId: string
}

export async function rejectClosure({ userId, workBookId, reason }: RejectClosureProps) {
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
		const user = await prisma.user.findUnique({
			where: { id: userId },
		})
		if (!user) {
			return { ok: false, message: "Usuario no encontrado" }
		}

		const workOrder = await prisma.workOrder.findUnique({
			where: { id: workBookId },
			include: {
				closureRequestedBy: true,
				company: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		})

		if (!workOrder) {
			return { ok: false, message: "Libro de obras no encontrado" }
		}

		// Verificar que haya una solicitud de cierre pendiente
		if (workOrder.status !== "CLOSURE_REQUESTED") {
			return { ok: false, message: "No hay una solicitud de cierre pendiente" }
		}

		// Actualizar el estado del libro de obras
		const updatedWorkOrder = await prisma.workOrder.update({
			where: { id: workBookId },
			data: {
				status: "IN_PROGRESS",
				closureRejectedReason: reason || null,
			},
		})

		// Crear una entrada en el libro de obras
		const workEntry = await prisma.workEntry.create({
			data: {
				entryType: "COMMENT",
				comments: `Solicitud de cierre rechazada${reason ? `: ${reason}` : ""}`,
				workOrderId: workBookId,
				createdById: userId,
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.WORK_ORDERS,
			action: ACTIVITY_TYPE.REJECT,
			entityId: workBookId,
			entityType: "WorkOrder",
			metadata: {
				status: updatedWorkOrder.status,
				otNumber: workOrder.otNumber,
				workName: workOrder.workName,
				reason,
				workEntryId: workEntry.id,
				workEntryComments: workEntry.comments,
				companyId: workOrder.company?.id,
				companyName: workOrder.company?.name,
				closureRequestedById: workOrder.closureRequestedBy?.id,
				closureRequestedByName: workOrder.closureRequestedBy?.name,
			},
		})

		// Enviar correo al supervisor que solicitó el cierre
		if (workOrder.closureRequestedBy?.email) {
			await sendRejectClosureEmail({
				rejectionReason: reason,
				supervisorName: user.name,
				workOrderNumber: workOrder.otNumber,
				workOrderName: workOrder.workName || "",
				email: workOrder.closureRequestedBy.email,
				companyName: workOrder?.company?.name || "Interno",
			})
		}

		return { ok: true, message: "OK" }
	} catch (error) {
		console.error("[WORK_BOOK_REJECT_CLOSURE]", error)
		return { ok: false, message: "Error al rechazar el cierre" }
	}
}
