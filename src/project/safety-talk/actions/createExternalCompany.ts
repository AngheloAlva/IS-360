"use server"

import { randomBytes } from "crypto"

import { sendVisitorTalkInviteEmail } from "@/project/safety-talk/actions/sendVisitorTalkInviteEmail"
import prisma from "@/lib/prisma"

import type { ExternalCompanySchema } from "@/project/safety-talk/schemas/external-company.schema"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { ACTIVITY_TYPE, MODULES } from "@prisma/client"

type CreateExternalCompanyParams = {
	values: ExternalCompanySchema
	videoUrl: string
	expiresAt?: Date
}

export async function createExternalCompany({
	values,
	videoUrl,
	expiresAt,
}: CreateExternalCompanyParams) {
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
		const existingCompany = await prisma.externalCompany.findUnique({
			where: { rut: values.rut },
		})

		const uniqueToken = randomBytes(16).toString("hex")

		const result = await prisma.$transaction(async (tx) => {
			let company

			if (existingCompany) {
				const newEmails = values.emails.map((item) => item.email)
				const existingEmails = existingCompany.emails

				const mergedEmails = [...new Set([...existingEmails, ...newEmails])]

				company = await tx.externalCompany.update({
					where: { id: existingCompany.id },
					data: {
						name: values.name,
						emails: mergedEmails,
					},
				})
			} else {
				company = await tx.externalCompany.create({
					data: {
						name: values.name,
						rut: values.rut,
						emails: values.emails.map((item) => item.email),
					},
				})
			}

			const visitorTalk = await tx.visitorTalk.create({
				data: {
					uniqueToken,
					videoUrl,
					expiresAt,
					companyId: company.id,
				},
			})

			const visitors = await Promise.all(
				values.emails.map(async (emailItem) => {
					const existingVisitor = await tx.externalVisitor.findUnique({
						where: {
							email_companyId: {
								email: emailItem.email,
								companyId: company.id,
							},
						},
					})

					if (existingVisitor) {
						return existingVisitor
					} else {
						return tx.externalVisitor.create({
							data: {
								rut: "",
								name: "",
								email: emailItem.email,
								companyId: company.id,
							},
						})
					}
				})
			)

			return {
				company,
				visitorTalk,
				visitors,
				isExistingCompany: !!existingCompany,
			}
		})

		const emailPromises = values.emails.map(async (emailItem) => {
			try {
				await sendVisitorTalkInviteEmail({
					companyName: values.name,
					visitorEmail: emailItem.email,
					accessToken: result.visitorTalk.uniqueToken,
					expiresAt:
						result.visitorTalk.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
				})
				return { email: emailItem.email, sent: true }
			} catch (error) {
				console.error(`Error sending email to ${emailItem.email}:`, error)
				return { email: emailItem.email, sent: false, error }
			}
		})

		const emailResults = await Promise.allSettled(emailPromises)
		const successfulEmails = emailResults.filter(
			(result) => result.status === "fulfilled" && result.value.sent
		).length

		const message = result.isExistingCompany
			? `Charla de visitantes creada exitosamente. Se agregaron nuevos emails a la empresa existente. Invitaciones enviadas: ${successfulEmails}/${values.emails.length}`
			: `Empresa externa y charla de visitantes creada exitosamente. Invitaciones enviadas: ${successfulEmails}/${values.emails.length}`

		logActivity({
			userId: session.user.id,
			entityId: result.company.id,
			module: MODULES.SAFETY_TALK,
			action: ACTIVITY_TYPE.CREATE,
			entityType: "ExternalCompany",
			metadata: {
				name: result.company.name,
				rut: result.company.rut,
				emails: result.company.emails,
			},
		})

		return {
			ok: true,
			message,
			data: {
				...result,
				emailsSent: successfulEmails,
				totalEmails: values.emails.length,
			},
		}
	} catch (error) {
		console.error("Error creating external company:", error)
		return {
			ok: false,
			message: "Error interno del servidor",
			data: null,
		}
	}
}
