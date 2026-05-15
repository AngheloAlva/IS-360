"use server"

import prisma from "@/lib/prisma"

import type { SAFETY_TALK_CATEGORY } from "@/generated/prisma/enums"

type GetVisitorTalkResult = {
	success: boolean
	error?: string
	data?: {
		id: string
		videoUrl: string
		category: SAFETY_TALK_CATEGORY
		expiresAt: Date | null
		company: {
			id: string
			name: string
			rut: string
			emails: string[]
		}
		visitor?: {
			id: string
			name: string
			rut: string
			email: string
		}
		completion?: {
			id: string
			status: string
			passed: boolean | null
			score: number | null
			completedAt: Date | null
		}
	}
}

export async function getVisitorTalk(token: string, email: string): Promise<GetVisitorTalkResult> {
	try {
		const visitorTalk = await prisma.visitorTalk.findUnique({
			where: { uniqueToken: token },
			include: {
				company: true,
			},
		})

		if (!visitorTalk) {
			return {
				success: false,
				error: "Charla no encontrada",
			}
		}

		if (visitorTalk.expiresAt && visitorTalk.expiresAt < new Date()) {
			return {
				success: false,
				error: "Esta charla ha expirado",
			}
		}

		if (!visitorTalk.company.emails.includes(email)) {
			return {
				success: false,
				error: "Tu email no está autorizado para acceder a esta charla",
			}
		}

		// Buscar visitor
		const visitor = await prisma.externalVisitor.findFirst({
			where: {
				email,
				companyId: visitorTalk.companyId,
			},
		})

		// Buscar completion si existe visitor
		let completion = null
		if (visitor) {
			completion = await prisma.visitorTalkCompletion.findUnique({
				where: {
					visitorId_visitorTalkId: {
						visitorId: visitor.id,
						visitorTalkId: visitorTalk.id,
					},
				},
			})
		}

		return {
			success: true,
			data: {
				id: visitorTalk.id,
				videoUrl: visitorTalk.videoUrl,
				category: visitorTalk.category,
				expiresAt: visitorTalk.expiresAt,
				company: {
					id: visitorTalk.company.id,
					name: visitorTalk.company.name,
					rut: visitorTalk.company.rut,
					emails: visitorTalk.company.emails,
				},
				visitor: visitor
					? {
							id: visitor.id,
							name: visitor.name,
							rut: visitor.rut,
							email: visitor.email,
						}
					: undefined,
				completion: completion
					? {
							id: completion.id,
							status: completion.status,
							passed: completion.passed,
							score: completion.score,
							completedAt: completion.completedAt,
						}
					: undefined,
			},
		}
	} catch (error) {
		console.error("Error getting visitor talk:", error)
		return {
			success: false,
			error: "Error al cargar la charla",
		}
	}
}
