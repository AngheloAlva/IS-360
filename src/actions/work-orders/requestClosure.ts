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
				supervisor: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				company: {
					select: {
						name: true,
						rut: true,
					},
				},
				responsible: {
					select: {
						name: true,
						email: true,
					},
				},
			},
		})

		if (!workOrder) {
			return {
				ok: false,
				message: "Solicitud de cierre no encontrada",
			}
		}

		// Verificar que el usuario sea supervisor de la empresa colaboradora
		if (user.id !== workOrder.supervisor.id) {
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
		if (workOrder.responsible.email) {
			await sendRequestClosureEmail({
				workOrderId: workOrder.id,
				supervisorName: user.name,
				email: workOrder.responsible.email,
				workOrderNumber: workOrder.otNumber,
				workOrderName: `Libro de Obras ${workOrder.otNumber}`,
				companyName: workOrder.company
					? workOrder.company.name + " - " + workOrder.company.rut
					: "Interno",
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
