"use server"

import { z } from "zod"

// import { sendNotification } from "@/shared/actions/notifications/send-notification"
// import { sendRequestReviewEmail } from "../emails/send-request-review-email"
import { LABOR_CONTROL_STATUS } from "@prisma/client"
import prisma from "@/lib/prisma"

export const submitLaborControlFolderForReview = async ({
	userId,
	folderId,
}: {
	userId: string
	folderId: string
}) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			rut: true,
			name: true,
			email: true,
			phone: true,
			companyId: true,
		},
	})

	if (!user) {
		return { ok: false, message: "Usuario no encontrado." }
	}

	try {
		const folder = await prisma.laborControlFolder.findUnique({
			where: {
				id: folderId,
			},
			select: {
				company: {
					select: {
						name: true,
					},
				},
				id: true,
				status: true,
			},
		})

		if (!folder) {
			return { ok: false, message: "Carpeta no encontrada." }
		}

		if (
			folder.status !== LABOR_CONTROL_STATUS.DRAFT &&
			folder.status !== LABOR_CONTROL_STATUS.REJECTED
		) {
			return {
				ok: false,
				message: `La carpeta no se puede enviar a revisión porque su estado actual es '${folder.status}'. Solo carpetas en Borrador o Rechazada pueden ser enviadas.`,
			}
		}

		await prisma.laborControlFolder.update({
			where: {
				id: folderId,
			},
			data: {
				status: LABOR_CONTROL_STATUS.SUBMITTED,
			},
		})

		const documents = await prisma.laborControlDocument.findMany({
			where: {
				folderId: folder.id,
			},
			select: {
				id: true,
				status: true,
			},
		})

		await Promise.all(
			documents.map(async (document) => {
				const newStatus =
					document.status === LABOR_CONTROL_STATUS.APPROVED
						? LABOR_CONTROL_STATUS.APPROVED
						: LABOR_CONTROL_STATUS.SUBMITTED

				await prisma.laborControlDocument.update({
					where: {
						id: document.id,
					},
					data: {
						status: newStatus,
						uploadDate: new Date(),
					},
				})
			})
		)

		return {
			ok: true,
			message: "Los documentos han sido enviados a revisión correctamente.",
		}
	} catch (error) {
		console.error("Error al enviar los documentos a revisión:", error)
		if (error instanceof z.ZodError) {
			return {
				ok: false,
				message: "Error de validación: " + error.errors.map((e) => e.message).join(", "),
			}
		}
		return { ok: false, message: "Ocurrió un error en el servidor." }
	}
}
