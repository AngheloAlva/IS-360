"use server"

import { headers } from "next/headers"

import { sendApproveClosureEmail } from "./sendApproveEmail"
import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface ApproveWorkBookClosureProps {
	workBookId: string
	userId: string
}

export async function approveWorkBookClosure({ userId, workBookId }: ApproveWorkBookClosureProps) {
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
				closureRequestedBy: {
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
			return {
				ok: false,
				message: "Libro de obras no encontrado",
			}
		}

		if (workOrder.status !== "CLOSURE_REQUESTED") {
			return {
				ok: false,
				message: "No hay solicitud de cierre pendiente",
			}
		}

		const updatedWorkOrder = await prisma.workOrder.update({
			where: { id: workBookId },
			data: {
				status: "COMPLETED",
				closureApprovedById: userId,
				closureApprovedAt: new Date(),
			},
			select: {
				id: true,
				status: true,
				otNumber: true,
				workName: true,
				closureApprovedById: true,
				closureApprovedAt: true,
			},
		})

		const workEntry = await prisma.workEntry.create({
			data: {
				entryType: "COMMENT",
				comments: "Cierre del libro de obras aprobado",
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
			action: ACTIVITY_TYPE.APPROVE,
			entityId: updatedWorkOrder.id,
			entityType: "WorkOrder",
			metadata: {
				status: updatedWorkOrder.status,
				otNumber: updatedWorkOrder.otNumber,
				workName: updatedWorkOrder.workName,
				closureApprovedById: updatedWorkOrder.closureApprovedById,
				closureApprovedAt: updatedWorkOrder.closureApprovedAt,
				workEntryId: workEntry.id,
				workEntryComments: workEntry.comments,
				companyId: workOrder.company?.id,
				companyName: workOrder.company?.name,
			},
		})

		if (workOrder.closureRequestedBy?.email) {
			await sendApproveClosureEmail({
				supervisorName: session.user.name,
				workOrderNumber: workOrder.otNumber,
				workOrderName: workOrder.workName || "",
				email: workOrder.closureRequestedBy.email,
				companyName: workOrder?.company?.name || "Interno",
			})
		}

		return {
			ok: true,
			message: "Cierre del libro de obras aprobado exitosamente",
		}
	} catch (error) {
		console.error("[WORK_BOOK_APPROVE_CLOSURE]", error)
		return {
			ok: false,
			message: "Error al aprobar el cierre del libro de obras",
		}
	}
}
