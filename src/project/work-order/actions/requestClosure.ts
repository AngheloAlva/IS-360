"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import { sendRequestClosureEmail } from "./sendRequestEmail"

interface RequestClosureParams {
	workBookId: string
	userId: string
}

export async function requestClosure({ userId, workBookId }: RequestClosureParams) {
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
						id: true,
						name: true,
						rut: true,
					},
				},
				responsible: {
					select: {
						id: true,
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
		const updatedWorkOrder = await prisma.workOrder.update({
			where: { id: workBookId },
			data: {
				status: "CLOSURE_REQUESTED",
				closureRequestedById: userId,
				closureRequestedAt: new Date(),
			},
		})

		// Crear una entrada en el libro de obras
		const workEntry = await prisma.workEntry.create({
			data: {
				entryType: "COMMENT",
				comments: "Solicitud de cierre del libro de obras",
				workOrderId: workBookId,
				createdById: userId,
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.WORK_ORDERS,
			action: ACTIVITY_TYPE.SUBMIT,
			entityId: workBookId,
			entityType: "WorkOrder",
			metadata: {
				status: updatedWorkOrder.status,
				otNumber: workOrder.otNumber,
				workEntryId: workEntry.id,
				workEntryComments: workEntry.comments,
				companyId: workOrder.company?.id,
				companyName: workOrder.company?.name,
				supervisorId: workOrder.supervisor?.id,
				supervisorName: workOrder.supervisor?.name,
				responsibleId: workOrder.responsible?.id,
				responsibleName: workOrder.responsible?.name,
				closureRequestedAt: updatedWorkOrder.closureRequestedAt,
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
