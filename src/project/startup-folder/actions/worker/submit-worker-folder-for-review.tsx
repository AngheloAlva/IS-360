"use server"

import { z } from "zod"

import { sendRequestReviewEmail } from "../emails/send-request-review-email"
import { DocumentCategory, ReviewStatus } from "@prisma/client"
import prisma from "@/lib/prisma"

export const submitWorkerFolderForReview = async ({
	userId,
	emails,
	workerId,
	folderId,
	companyId,
}: {
	userId: string
	emails: string[]
	folderId: string
	workerId: string
	companyId: string
}) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				rut: true,
				name: true,
				phone: true,
				email: true,
			},
		})

		if (!user) {
			return { ok: false, message: "Usuario no encontrado." }
		}

		const folder = await prisma.workerFolder.findUnique({
			where: {
				workerId_startupFolderId: {
					workerId,
					startupFolderId: folderId,
				},
			},
			select: {
				id: true,
				status: true,
				worker: {
					select: {
						name: true,
						rut: true,
						phone: true,
						email: true,
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
			},
		})

		if (!folder) {
			return { ok: false, message: "No se encontró la carpeta." }
		}

		const invalidFolder =
			folder.status !== ReviewStatus.DRAFT && folder.status !== ReviewStatus.REJECTED

		if (invalidFolder) {
			return {
				ok: false,
				message: `La carpeta no se puede enviar a revisión porque su estado actual es '${folder.status}'. Solo carpetas en DRAFT o REJECTED pueden ser enviadas.`,
			}
		}

		await prisma.$transaction(async (tx) => {
			await tx.workerFolder.update({
				where: { id: folder.id },
				data: {
					submittedAt: new Date(),
					status: ReviewStatus.SUBMITTED,
					additionalNotificationEmails: [...emails, user.email],
				},
			})

			const documents = await prisma.workerDocument.findMany({
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
						document.status === ReviewStatus.APPROVED
							? ReviewStatus.APPROVED
							: ReviewStatus.SUBMITTED

					await prisma.workerDocument.update({
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
		})

		const company = await prisma.company.findUnique({
			where: {
				id: companyId,
			},
			select: {
				id: true,
				name: true,
			},
		})

		if (!company) {
			return { ok: false, message: "Empresa no encontrada." }
		}

		await sendRequestReviewEmail({
			solicitator: {
				name: user.name,
				rut: user.rut,
				phone: user.phone,
				email: user.email,
			},
			companyName: company.name,
			solicitationDate: new Date(),
			documentCategory: DocumentCategory.PERSONNEL,
			folderName: folder.startupFolder.name + " - " + folder.worker.name,
			reviewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard/carpetas-de-arranques/${company.id}`,
		})

		return {
			ok: true,
			message: "La carpeta ha sido enviada a revisión correctamente.",
		}
	} catch (error) {
		console.error("Error al enviar la carpeta a revisión:", error)
		if (error instanceof z.ZodError) {
			return {
				ok: false,
				message: "Error de validación: " + error.errors.map((e) => e.message).join(", "),
			}
		}
		return { ok: false, message: "Ocurrió un error en el servidor." }
	}
}
