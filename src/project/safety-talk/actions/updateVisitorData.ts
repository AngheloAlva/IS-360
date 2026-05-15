"use server"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"
import { SYSTEM_USER_ID } from "@/lib/consts/system-user"
import { type VisitorDataSchema } from "@/project/safety-talk/schemas/external-company.schema"

type UpdateVisitorDataParams = {
	token: string
	email: string
	visitorData: VisitorDataSchema
}

export async function updateVisitorData({
	token,
	email,
	visitorData,
}: UpdateVisitorDataParams) {
	try {
		// Find the visitor talk by token
		const visitorTalk = await prisma.visitorTalk.findUnique({
			where: { uniqueToken: token },
			include: {
				company: true,
			},
		})

		if (!visitorTalk) {
			return {
				ok: false,
				message: "Token de charla no válido",
				data: null,
			}
		}

		// Check if the talk is still active and not expired
		if (!visitorTalk.isActive) {
			return {
				ok: false,
				message: "La charla ya no está activa",
				data: null,
			}
		}

		if (visitorTalk.expiresAt && visitorTalk.expiresAt < new Date()) {
			return {
				ok: false,
				message: "La charla ha expirado",
				data: null,
			}
		}

		// Check if the email is authorized for this company
		if (!visitorTalk.company.emails.includes(email)) {
			return {
				ok: false,
				message: "Email no autorizado para esta empresa",
				data: null,
			}
		}

		// Find or create the external visitor
		let visitor = await prisma.externalVisitor.findUnique({
			where: {
				email_companyId: {
					email: email,
					companyId: visitorTalk.companyId,
				},
			},
		})

		if (!visitor) {
			return {
				ok: false,
				message: "Visitante no encontrado",
				data: null,
			}
		}

		// Update visitor data
		visitor = await prisma.externalVisitor.update({
			where: { id: visitor.id },
			data: {
				name: visitorData.name,
				rut: visitorData.rut,
			},
		})

		// Create or update visitor talk completion
		const completion = await prisma.visitorTalkCompletion.upsert({
			where: {
				visitorId_visitorTalkId: {
					visitorId: visitor.id,
					visitorTalkId: visitorTalk.id,
				},
			},
			create: {
				visitorId: visitor.id,
				visitorTalkId: visitorTalk.id,
				status: "NOT_STARTED",
			},
			update: {},
		})

  await logActivity({
			userId: SYSTEM_USER_ID,
			module: MODULES.SAFETY_TALK,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: visitor.id,
			entityType: "ExternalVisitor",
			metadata: {
				visitorEmail: visitor.email,
				updatedFields: Object.keys(visitorData),
				name: visitor.name,
				rut: visitor.rut,
				companyId: visitorTalk.companyId,
				visitorTalkId: visitorTalk.id,
				completionId: completion.id,
				externalUpdate: true,
			},
		})

		return {
			ok: true,
			message: "Datos del visitante actualizados exitosamente",
			data: {
				visitor,
				completion,
				visitorTalk,
			},
		}
	} catch (error) {
		console.error("Error updating visitor data:", error)
		return {
			ok: false,
			message: "Error interno del servidor",
			data: null,
		}
	}
}