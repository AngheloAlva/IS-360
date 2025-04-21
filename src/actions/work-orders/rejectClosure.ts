"use server"

import { sendRejectClosureEmail } from "./sendRejectClosure"
import prisma from "@/lib/prisma"

interface RejectClosureProps {
	userId: string
	workBookId: string
	reason?: string
}

export async function rejectClosure({ userId, workBookId, reason }: RejectClosureProps) {
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		})
		if (!user) {
			return { ok: false, message: "User not found" }
		}

		const workOrder = await prisma.workOrder.findUnique({
			where: { id: workBookId },
			include: {
				closureRequestedBy: true,
				company: {
					select: {
						name: true,
					},
				},
			},
		})

		if (!workOrder) {
			return { ok: false, message: "Work order not found" }
		}

		// Verificar que el usuario sea supervisor de OTC
		if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
			return { ok: false, message: "Forbidden" }
		}

		// Verificar que haya una solicitud de cierre pendiente
		if (workOrder.status !== "CLOSURE_REQUESTED") {
			return { ok: false, message: "No closure request pending" }
		}

		// Actualizar el estado del libro de obras
		await prisma.workOrder.update({
			where: { id: workBookId },
			data: {
				status: "IN_PROGRESS",
				closureRejectedReason: reason || null,
			},
		})

		// Crear una entrada en el libro de obras
		await prisma.workEntry.create({
			data: {
				entryType: "COMMENT",
				comments: `Solicitud de cierre rechazada${reason ? `: ${reason}` : ""}`,
				workOrderId: workBookId,
				createdById: userId,
			},
		})

		// Enviar correo al supervisor que solicitó el cierre
		if (workOrder.closureRequestedBy?.email) {
			await sendRejectClosureEmail({
				rejectionReason: reason,
				supervisorName: user.name,
				companyName: workOrder.company.name,
				workOrderNumber: workOrder.otNumber,
				workOrderName: workOrder.workName || "",
				email: workOrder.closureRequestedBy.email,
			})
		}

		return { ok: true, message: "OK" }
	} catch (error) {
		console.error("[WORK_BOOK_REJECT_CLOSURE]", error)
		return { ok: false, message: "Internal error" }
	}
}
