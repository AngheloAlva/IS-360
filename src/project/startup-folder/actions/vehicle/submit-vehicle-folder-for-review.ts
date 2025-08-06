"use server"

import { z } from "zod"

import { sendNotification } from "@/shared/actions/notifications/send-notification"
import { sendRequestReviewEmail } from "../emails/send-request-review-email"
import { DocumentCategory, ReviewStatus } from "@prisma/client"
import { generateSlug } from "@/lib/generateSlug"
import { USER_ROLE } from "@/lib/permissions"
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
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				email: true,
				rut: true,
				name: true,
				phone: true,
			},
		})

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

		const invalidFolder =
			folder.status !== ReviewStatus.DRAFT && folder.status !== ReviewStatus.REJECTED

		if (invalidFolder) {
			return {
				ok: false,
				message: `La carpeta no se puede enviar a revisión porque su estado actual es '${folder.status}'. Solo carpetas en DRAFT o REJECTED pueden ser enviadas.`,
			}
		}

		await prisma.$transaction(async (tx) => {
			await tx.vehicleFolder.update({
				where: { id: folder.id },
				data: {
					submittedAt: new Date(),
					status: ReviewStatus.SUBMITTED,
					additionalNotificationEmails: [...emails, user.email],
				},
				select: {
					startupFolder: {
						select: {
							company: {
								select: {
									name: true,
								},
							},
						},
					},
				},
			})

			const documents = await prisma.vehicleDocument.findMany({
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
							: document.status === ReviewStatus.TO_UPDATE
								? ReviewStatus.TO_UPDATE
								: ReviewStatus.SUBMITTED

					await prisma.vehicleDocument.update({
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

		const folderLink = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard/carpetas-de-arranques/${generateSlug(folder.startupFolder.company.name)}_${folder.startupFolder.company.id}`

		sendNotification({
			link: folderLink,
			creatorId: userId,
			type: "VEHICLE_FOLDER_SUBMITTED",
			title: `Carpeta de vehículos enviada a revisión`,
			targetRoles: [USER_ROLE.admin, USER_ROLE.startupFolderOperator],
			message: `La empresa ${folder.startupFolder.company.name} ha enviado la subcarpeta de vehículos ${folder.vehicle.plate} - ${folder.vehicle.brand} - ${folder.vehicle.model} (${folder.startupFolder.name}) a revisión`,
		})

		sendRequestReviewEmail({
			solicitator: {
				email: user.email,
				name: user.name,
				rut: user.rut,
				phone: user.phone,
			},
			reviewUrl: folderLink,
			companyName: company.name,
			solicitationDate: new Date(),
			documentCategory: DocumentCategory.VEHICLES,
			folderName:
				folder.startupFolder.name +
				" - " +
				folder.vehicle.plate +
				" " +
				folder.vehicle.brand +
				" " +
				folder.vehicle.model,
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
