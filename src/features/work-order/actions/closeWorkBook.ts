"use server"

import { sendRejectClosureEmail } from "./sendRejectClosure"
import prisma from "@/lib/prisma"

interface CloseWorkBookProps {
	userId: string
	reason?: string
	workBookId: string
}

export async function closeWorkBook({ userId, workBookId, reason }: CloseWorkBookProps) {
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
						name: true,
					},
				},
			},
		})

		if (!workOrder) {
			return { ok: false, message: "Libro de obras no encontrado" }
		}

		await prisma.workOrder.update({
			where: { id: workBookId },
			data: {
				status: "CANCELLED",
				closureRejectedReason: reason || null,
			},
		})

		await prisma.workEntry.create({
			data: {
				entryType: "COMMENT",
				comments: `Libro de obras cerrado ${reason ? `: ${reason}` : ""}`,
				workOrderId: workBookId,
				createdById: userId,
			},
		})

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
		console.error("[WORK_BOOK_CLOSE]", error)
		return { ok: false, message: "Error al cerrar el libro de obras" }
	}
}
