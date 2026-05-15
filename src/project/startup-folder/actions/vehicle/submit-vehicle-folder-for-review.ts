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

export const submitVehicleFolderForReview = async ({
	emails,
	userId,
	folderId,
	companyId,
	vehicleId,
}: {
	userId: string
	emails: string[]
	folderId: string
	companyId: string
	vehicleId: string
}) => {
	try {
		const user = await getSubmitRequester(userId)

		if (!user) {
			return { ok: false, message: "Usuario no encontrado." }
		}

		const folder = await prisma.vehicleFolder.findUnique({
			where: {
				vehicleId_startupFolderId: {
					vehicleId,
					startupFolderId: folderId,
				},
			},
			select: {
				id: true,
				status: true,
				vehicle: {
					select: {
						plate: true,
						brand: true,
						model: true,
					},
				},
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
			},
		})

		if (!folder) {
			return { ok: false, message: "No se encontró la carpeta." }
		}

		if (!isSubmittableFolderStatus(folder.status)) {
			return {
				ok: false,
				message: `La carpeta no se puede enviar a revisión porque su estado actual es '${folder.status}'. Solo carpetas en DRAFT o REJECTED pueden ser enviadas.`,
			}
		}

		await submitFolderDocuments({
			updateFolder: (tx, submittedAt) =>
				tx.vehicleFolder.update({
					where: { id: folder.id },
					data: {
						submittedAt,
						status: ReviewStatus.SUBMITTED,
						additionalNotificationEmails: mergeNotificationEmails(emails, user.email),
					},
				}),
			getDocuments: (tx) =>
				tx.vehicleDocument.findMany({
					where: {
						folderId: folder.id,
					},
					select: {
						id: true,
						status: true,
					},
				}),
			updateDocument: (tx, documentId, status, submittedAt) =>
				tx.vehicleDocument.update({
					where: {
						id: documentId,
					},
					data: {
						status,
						submittedAt,
					},
				}),
		})

		if (folder.startupFolder.company.id !== companyId) {
			return { ok: false, message: "La carpeta no pertenece a la empresa seleccionada." }
		}

		const folderLink = buildStartupFolderAdminReviewUrl(
			folder.startupFolder.company.name,
			folder.startupFolder.company.id,
			folderId
		)

  await sendRequestReviewEmail(
			buildRequestReviewEmailPayload({
				category: DocumentCategory.VEHICLES,
				reviewUrl: folderLink,
				companyName: folder.startupFolder.company.name,
				startupFolderName: folder.startupFolder.name,
				vehicle: {
					plate: folder.vehicle.plate,
					brand: folder.vehicle.brand,
					model: folder.vehicle.model,
				},
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
