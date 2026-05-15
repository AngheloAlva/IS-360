"use server"

import { z } from "zod"

import { sendRequestReviewEmail } from "../emails/send-request-review-email"
import {
	buildRequestReviewEmailPayload,
	buildStartupFolderAdminReviewUrl,
	getSubmitRequester,
	isSubmittableFolderStatus,
	mergeNotificationEmails,
	submitFolderDocuments,
} from "../submit-review-helpers"
import { DocumentCategory, ReviewStatus } from "@/generated/prisma/enums"
import prisma from "@/lib/prisma"

export const submitEnvironmentFolderForReview = async ({
	emails,
	userId,
	folderId,
}: {
	userId: string
	emails: string[]
	folderId: string
}) => {
	const user = await getSubmitRequester(userId)

	if (!user) {
		return { ok: false, message: "Usuario no encontrado." }
	}

	try {
		const folder = await prisma.environmentFolder.findUnique({
			where: { startupFolderId: folderId },
			select: {
				startupFolder: {
					select: {
						name: true,
						company: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
				id: true,
				status: true,
			},
		})

		if (!folder) {
			return { ok: false, message: "Carpeta no encontrada." }
		}

		if (!isSubmittableFolderStatus(folder.status)) {
			return {
				ok: false,
				message: `La carpeta no se puede enviar a revisión porque su estado actual es '${folder.status}'. Solo carpetas en Borrador o Rechazada pueden ser enviadas.`,
			}
		}

		await submitFolderDocuments({
			updateFolder: (tx, submittedAt) =>
				tx.environmentFolder.update({
					where: { id: folder.id },
					data: {
						submittedAt,
						status: ReviewStatus.SUBMITTED,
						additionalNotificationEmails: mergeNotificationEmails(emails, user.email),
					},
				}),
			getDocuments: (tx) =>
				tx.environmentDocument.findMany({
					where: {
						folderId: folder.id,
					},
					select: {
						id: true,
						status: true,
					},
				}),
			updateDocument: (tx, documentId, status, submittedAt) =>
				tx.environmentDocument.update({
					where: {
						id: documentId,
					},
					data: {
						status,
						submittedAt,
					},
				}),
		})

		const folderLink = buildStartupFolderAdminReviewUrl(
			folder.startupFolder.company.name,
			folder.startupFolder.company.id,
			folderId
		)

  await sendRequestReviewEmail(
			buildRequestReviewEmailPayload({
				category: DocumentCategory.ENVIRONMENT,
				reviewUrl: folderLink,
				companyName: folder.startupFolder.company.name,
				startupFolderName: folder.startupFolder.name,
				solicitator: {
					email: user.email,
					name: user.name,
					rut: user.rut,
					phone: user.phone,
				},
			})
		)

		return {
			ok: true,
			message: "La carpeta ha sido enviada a revisión correctamente.",
		}
	} catch (error) {
		console.error("Error al enviar la carpeta a revisión:", error)
		if (error instanceof z.ZodError) {
			return {
				ok: false,
				message: "Error de validación: " + error.issues.map((e) => e.message).join(", "),
			}
		}
		return { ok: false, message: "Ocurrió un error en el servidor." }
	}
}
