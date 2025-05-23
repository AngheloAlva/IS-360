"use server"

import { sendApproveClosureEmail } from "./sendApproveEmail"
import prisma from "@/lib/prisma"

interface ApproveWorkBookClosureProps {
	workBookId: string
	userId: string
}

export async function approveWorkBookClosure({ userId, workBookId }: ApproveWorkBookClosureProps) {
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		})

		if (!user) {
			return {
				ok: false,
				message: "User not found",
			}
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
			return {
				ok: false,
				message: "Work order not found",
			}
		}

		// Verificar que haya una solicitud de cierre pendiente
		if (workOrder.status !== "CLOSURE_REQUESTED") {
			return {
				ok: false,
				message: "No closure request pending",
			}
		}

		// Actualizar el estado del libro de obras
		await prisma.workOrder.update({
			where: { id: workBookId },
			data: {
				status: "COMPLETED",
				closureApprovedById: userId,
				closureApprovedAt: new Date(),
			},
		})

		// Crear una entrada en el libro de obras
		await prisma.workEntry.create({
			data: {
				entryType: "COMMENT",
				comments: "Cierre del libro de obras aprobado",
				workOrderId: workBookId,
				createdById: userId,
			},
		})

		// Enviar correo al supervisor que solicitó el cierre
		if (workOrder.closureRequestedBy?.email) {
			await sendApproveClosureEmail({
				supervisorName: user.name,
				workOrderNumber: workOrder.otNumber,
				workOrderName: workOrder.workName || "",
				email: workOrder.closureRequestedBy.email,
				companyName: workOrder?.company?.name || "Interno",
			})
		}

		return {
			ok: true,
			message: "OK",
		}
	} catch (error) {
		console.error("[WORK_BOOK_APPROVE_CLOSURE]", error)
		return {
			ok: false,
			message: "Internal error",
		}
	}
}
