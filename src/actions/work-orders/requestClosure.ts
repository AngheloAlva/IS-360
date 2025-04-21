"use server"

import prisma from "@/lib/prisma"

import { sendRequestClosureEmail } from "./sendRequestEmail"

interface RequestClosureParams {
	workBookId: string
	userId: string
}

export async function requestClosure({ userId, workBookId }: RequestClosureParams) {
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		})

		if (!user) {
			return {
				ok: false,
				message: "Usuario no encontrado",
			}
		}

		const workOrder = await prisma.workOrder.findUnique({
			where: { id: workBookId },
			include: {
				supervisor: true,
				company: true,
			},
		})

		if (!workOrder) {
			return {
				ok: false,
				message: "Solicitud de cierre no encontrada",
			}
		}

		// Verificar que el usuario sea supervisor de la empresa colaboradora
		if (!user.isSupervisor || user.role !== "PARTNER_COMPANY") {
			return {
				ok: false,
				message: "Forbidden",
			}
		}

		// Actualizar el estado del libro de obras
		await prisma.workOrder.update({
			where: { id: workBookId },
			data: {
				status: "CLOSURE_REQUESTED",
				closureRequestedById: userId,
				closureRequestedAt: new Date(),
			},
		})

		// Crear una entrada en el libro de obras
		await prisma.workEntry.create({
			data: {
				entryType: "COMMENT",
				comments: "Solicitud de cierre del libro de obras",
				workOrderId: workBookId,
				createdById: userId,
			},
		})

		// Enviar correo al supervisor de OTC
		if (workOrder.supervisor?.email) {
			await sendRequestClosureEmail({
				workOrderId: workOrder.id,
				supervisorName: user.name,
				email: workOrder.supervisor.email,
				workOrderNumber: workOrder.otNumber,
				companyName: workOrder.company.name,
				workOrderName: `Libro de Obras ${workOrder.otNumber}`,
			})
		}

		return {
			ok: true,
			message: "OK",
		}
	} catch (error) {
		console.error("[WORK_BOOK_REQUEST_CLOSURE]", error)
		return {
			ok: false,
			message: "Internal error",
		}
	}
}
