"use server"

import { z } from "zod"

import { sendRequestReviewEmail } from "../emails/send-request-review-email"
import { DocumentCategory, ReviewStatus } from "@prisma/client"
import prisma from "@/lib/prisma"

export const submitBasicFolderForReview = async ({
	emails,
	userId,
	workerId,
	folderId,
}: {
	userId: string
	workerId: string
	emails: string[]
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
		const folder = await prisma.basicFolder.findUnique({
			where: {
				workerId_startupFolderId: {
					workerId,
					startupFolderId: folderId,
				},
			},
			select: {
				worker: {
					select: {
						name: true,
					},
				},
				startupFolder: {
					select: {
						name: true,
						company: {
							select: {
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

		if (folder.status !== ReviewStatus.DRAFT && folder.status !== ReviewStatus.REJECTED) {
			return {
				ok: false,
				message: `La carpeta no se puede enviar a revisión porque su estado actual es '${folder.status}'. Solo carpetas en Borrador o Rechazada pueden ser enviadas.`,
			}
		}

		await prisma.basicFolder.update({
			where: {
				workerId_startupFolderId: {
					workerId,
					startupFolderId: folderId,
				},
			},
			data: {
				submittedAt: new Date(),
				status: ReviewStatus.SUBMITTED,
				additionalNotificationEmails: [...emails, user.email],
			},
		})

		const documents = await prisma.basicDocument.findMany({
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
					document.status === ReviewStatus.APPROVED ? ReviewStatus.APPROVED : ReviewStatus.SUBMITTED

				await prisma.basicDocument.update({
					where: {
						id: document.id,
					},
					data: {
						status: newStatus,
						submittedAt: new Date(),
					},
				})
			})
		)

		await sendRequestReviewEmail({
			solicitator: {
				email: user.email,
				name: user.name,
				rut: user.rut,
				phone: user.phone,
			},
			solicitationDate: new Date(),
			documentCategory: DocumentCategory.BASIC,
			companyName: folder.startupFolder.company.name,
			folderName: folder.startupFolder.name + " - " + folder.worker.name,
			reviewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard/carpetas-de-arranques/${user.companyId}`,
		})

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
