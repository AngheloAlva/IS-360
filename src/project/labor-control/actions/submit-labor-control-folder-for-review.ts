"use server"

import { z } from "zod"

import { sendRequestReviewEmail } from "./emails/send-request-review-email"
import { LABOR_CONTROL_STATUS } from "@prisma/client"
import { systemUrl } from "@/lib/consts/systemUrl"
import { generateSlug } from "@/lib/generateSlug"
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
						id: true,
						name: true,
					},
				},
				id: true,
				companyFolderStatus: true,
			},
		})

		if (!folder) {
			return { ok: false, message: "Carpeta no encontrada." }
		}

		if (
			folder.companyFolderStatus !== LABOR_CONTROL_STATUS.DRAFT &&
			folder.companyFolderStatus !== LABOR_CONTROL_STATUS.REJECTED
		) {
			return {
				ok: false,
				message: `La carpeta no se puede enviar a revisión porque su estado actual es '${folder.companyFolderStatus}'. Solo carpetas en Borrador o Rechazada pueden ser enviadas.`,
			}
		}

		await prisma.laborControlFolder.update({
			where: {
				id: folderId,
			},
			data: {
				emails: [user.email],
				companyFolderStatus: LABOR_CONTROL_STATUS.SUBMITTED,
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

		const companySlug = generateSlug(folder.company.name || "")
		const companyId = folder.company.id || ""

		try {
			const folderName = `Control Laboral - ${folder.company.name} - ${new Date().toLocaleDateString("es-CL", { month: "long", year: "numeric" })}`

			await sendRequestReviewEmail({
				folderName,
				reviewUrl: `${systemUrl}/admin/dashboard/control-laboral/${companySlug}_${companyId}`,
				companyName: folder.company.name,
				solicitationDate: new Date(),
				solicitator: {
					rut: user.rut,
					name: user.name,
					email: user.email,
					phone: user.phone,
				},
			})
		} catch (emailError) {
			console.error("Error al enviar email de notificación:", emailError)
			// No fallar la operación principal si el email falla
		}

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
