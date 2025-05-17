"use server"

import { z } from "zod"

import { ReviewStatus, Prisma } from "@prisma/client"
import { resend } from "@/lib/resend"
import prisma from "@/lib/prisma"

import { RequestReviewEmailTemplate } from "@/components/emails/startup-folders/RequestReviewEmailTemplate"

export async function submitForReview(
	emails: string[],
	folderId: string,
	message?: string
): Promise<{
	ok: boolean
	message: string
	folderId?: string
	failedEmails?: { email: string; error: string }[]
}> {
	if (!emails || emails.length === 0) {
		return {
			ok: false,
			message: "Por favor, ingresa al menos un correo electrónico.",
		}
	}

	try {
		// Get folder with company and work order with responsible user
		const folder = await prisma.startupFolder.findUnique({
			where: { id: folderId },
			include: {
				company: true,
				workOrder: {
					include: {
						responsible: {
							select: {
								name: true,
								email: true,
							},
						},
					},
				},
			},
		})

		if (!folder) {
			return { ok: false, message: "Carpeta no encontrada." }
		}

		if (folder.status !== ReviewStatus.DRAFT && folder.status !== ReviewStatus.REJECTED) {
			return {
				ok: false,
				message: `La carpeta no se puede enviar a revisión porque su estado actual es '${folder.status}'. Solo carpetas en DRAFT o REJECTED pueden ser enviadas.`,
			}
		}

		// Update folder status with proper typing
		type FolderWithCompanyAndWorkOrder = Prisma.StartupFolderGetPayload<{
			include: {
				company: true
				workOrder: {
					include: {
						responsible: {
							select: { name: true; email: true }
						}
					}
				}
			}
		}>

		const updatedFolder = (await prisma.startupFolder.update({
			where: { id: folderId },
			data: {
				submittedAt: new Date(),
				status: ReviewStatus.SUBMITTED,
				additionalNotificationEmails: emails,
			},
			include: {
				company: true,
				workOrder: {
					include: {
						responsible: {
							select: {
								name: true,
								email: true,
							},
						},
					},
				},
			},
		})) as unknown as FolderWithCompanyAndWorkOrder

		// Get the responsible user's name and email from the work order
		const submitterName = updatedFolder.workOrder?.responsible?.name || "Usuario del sistema"
		const submitterEmail = updatedFolder.workOrder?.responsible?.email
		const otNumber = updatedFolder.workOrder?.otNumber || "Carpeta"
		const companyName = updatedFolder.company?.name || "Compañía no especificada"

		// Include the submitter in the email list if they have an email
		const allRecipients = [...new Set([...emails, ...(submitterEmail ? [submitterEmail] : [])])]

		// Send emails to all recipients
		const emailPromises = allRecipients.map(async (email) => {
			const reviewLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/review/${folderId}`

			try {
				const { data, error } = await resend.emails.send({
					from: "anghelo.alva@ingenieriasimple.cl",
					// TODO: Change to the correct email
					to: "anghelo.alva@ingenieriasimple.cl",
					subject: `Solicitud de Revisión: ${otNumber} - ${companyName}`,
					react: await RequestReviewEmailTemplate({
						companyName: companyName,
						folderId: updatedFolder.id,
						folderName: otNumber,
						submittedBy: submitterName,
						submittedAt: new Date(),
						message: message,
						reviewLink: reviewLink,
					}),
				})

				if (error) {
					console.error(`Error sending email to ${email}:`, error)
					return { ok: false as const, error }
				}

				return { ok: true as const, data }
			} catch (error) {
				console.error(`Error sending email to ${email}:`, error)
				return { ok: false as const, error: error as Error }
			}
		})

		// Wait for all emails to be sent and collect results
		const results = await Promise.all(emailPromises)
		const failedEmails = results
			.filter((result): result is { ok: false; error: Error } => !result.ok)
			.map((result, index) => ({
				email: allRecipients[index],
				error: result.error.message,
			}))

		if (failedEmails.length > 0) {
			console.error("Failed to send some emails:", failedEmails)
			// Continue with the operation even if some emails failed
		}

		return {
			ok: true,
			message: "La carpeta ha sido enviada a revisión correctamente.",
			folderId: updatedFolder.id,
			failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
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
