"use server"

import { headers } from "next/headers"

import { sendCloseWorkBookEmail } from "./sendCloseWorkBookEmail"
import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface CloseWorkBookProps {
	userId: string
	reason: string
	workBookId: string
}

export async function closeWorkBook({ userId, workBookId, reason }: CloseWorkBookProps) {
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
			where: { id: workBookId },
			select: {
				id: true,
				status: true,
				otNumber: true,
				workName: true,
				supervisor: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
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

		const updatedWorkOrder = await prisma.workOrder.update({
			where: { id: workBookId },
			data: {
				status: "COMPLETED",
				closureRejectedReason: reason || null,
			},
			select: {
				id: true,
				status: true,
				otNumber: true,
				workName: true,
				closureRejectedReason: true,
			},
		})

		const workEntry = await prisma.workEntry.create({
			data: {
				entryType: "COMMENT",
				comments: `Libro de obras cerrado ${reason ? `: ${reason}` : ""}`,
				workOrderId: workBookId,
				createdById: userId,
			},
			select: {
				id: true,
				entryType: true,
				comments: true,
				workOrderId: true,
				createdById: true,
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.WORK_ORDERS,
			action: ACTIVITY_TYPE.CANCEL,
			entityId: updatedWorkOrder.id,
			entityType: "WorkOrder",
			metadata: {
				status: updatedWorkOrder.status,
				otNumber: updatedWorkOrder.otNumber,
				workName: updatedWorkOrder.workName,
				closureRejectedReason: updatedWorkOrder.closureRejectedReason,
				workEntryId: workEntry.id,
				workEntryComments: workEntry.comments,
				companyId: workOrder.company?.id,
				companyName: workOrder.company?.name,
				closureReason: reason,
			},
		})

		if (workOrder.supervisor.email) {
			await sendCloseWorkBookEmail({
				closureReason: reason,
				otNumber: workOrder.otNumber,
				supervisorName: session.user.name,
				email: workOrder.supervisor.email,
				workOrderNumber: workOrder.otNumber,
				workOrderName: workOrder.workName || "",
				companyName: workOrder?.company?.name || "Interno",
			})
		}

		return {
			ok: true,
			message: "Libro de obras cerrado exitosamente",
		}
	} catch (error) {
		console.error("[WORK_BOOK_CLOSE]", error)
		return { ok: false, message: "Error al cerrar el libro de obras" }
	}
}
