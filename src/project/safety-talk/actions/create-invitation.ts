"use server"

import { randomBytes } from "crypto"

import { CreateInvitationSchema } from "../schemas/attempt.schema"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function createInvitation(data: unknown) {
	try {
		const session = await auth.api.getSession({
			headers: await import("next/headers").then((mod) => mod.headers()),
		})

		if (!session?.user) {
			return {
				success: false,
				error: "No autenticado",
			}
		}

		if (session.user.accessRole !== "ADMIN") {
			return {
				success: false,
				error: "No tienes permisos para crear invitaciones",
			}
		}

		const validatedData = CreateInvitationSchema.parse(data)
		const { email, category, companyName } = validatedData

		let externalCompany = await prisma.externalCompany.findFirst({
			where: {
				name: companyName || "Empresa Externa",
			},
		})

		if (!externalCompany) {
			externalCompany = await prisma.externalCompany.create({
				data: {
					name: companyName || "Empresa Externa",
					rut: "00000000-0", // RUT temporal
					emails: [email],
				},
			})
		} else {
			// Agregar email si no existe
			if (!externalCompany.emails.includes(email)) {
				await prisma.externalCompany.update({
					where: { id: externalCompany.id },
					data: {
						emails: [...externalCompany.emails, email],
					},
				})
			}
		}

		// Generar token único
		const token = randomBytes(32).toString("hex")

		// Establecer fecha de expiración (1 semana)
		const expiresAt = new Date()
		expiresAt.setDate(expiresAt.getDate() + 7)

		// Crear VisitorTalk
		const visitorTalk = await prisma.visitorTalk.create({
			data: {
				expiresAt,
				videoUrl: "",
				uniqueToken: token,
				category: category,
				companyId: externalCompany.id,
			},
		})

		const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/charla-de-visitas/${token}?email=${encodeURIComponent(email)}`

		return {
			success: true,
			invitation: {
				id: visitorTalk.id,
				email: email,
				category: visitorTalk.category,
				token: visitorTalk.uniqueToken,
				url: invitationUrl,
				expiresAt: visitorTalk.expiresAt,
			},
			message: "Invitación creada exitosamente",
		}
	} catch (error) {
		console.error("Error creating invitation:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Error al crear la invitación",
		}
	}
}

export async function getInvitationByToken(token: string, email: string) {
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
				error: "Invitación no encontrada",
			}
		}

		if (visitorTalk.expiresAt && visitorTalk.expiresAt < new Date()) {
			return {
				success: false,
				error: "La invitación ha expirado",
			}
		}

		// Verificar que el email esté autorizado
		if (!visitorTalk.company.emails.includes(email)) {
			return {
				success: false,
				error: "Email no autorizado para esta charla",
			}
		}

		// Buscar o crear visitor
		const visitor = await prisma.externalVisitor.findFirst({
			where: {
				email,
				companyId: visitorTalk.companyId,
			},
		})

		// Buscar completion existente
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
			invitation: {
				id: visitorTalk.id,
				email: email,
				category: visitorTalk.category,
				status: completion?.status || "NOT_STARTED",
				name: visitor?.name,
				rut: visitor?.rut,
				companyName: visitorTalk.company.name,
				expiresAt: visitorTalk.expiresAt,
				passed: completion?.passed,
				score: completion?.score,
			},
		}
	} catch (error) {
		console.error("Error getting invitation:", error)
		return {
			success: false,
			error: "Error al obtener la invitación",
		}
	}
}

export async function updateExternalUserData(
	token: string,
	email: string,
	data: { name: string; rut: string; companyName: string }
) {
	try {
		const visitorTalk = await prisma.visitorTalk.findUnique({
			where: { uniqueToken: token },
		})

		if (!visitorTalk) {
			return {
				success: false,
				error: "Invitación no encontrada",
			}
		}

		// Buscar o crear visitor
		let visitor = await prisma.externalVisitor.findFirst({
			where: {
				email,
				companyId: visitorTalk.companyId,
			},
		})

		if (visitor) {
			// Actualizar datos existentes
			await prisma.externalVisitor.update({
				where: { id: visitor.id },
				data: {
					name: data.name,
					rut: data.rut,
				},
			})
		} else {
			// Crear nuevo visitor
			visitor = await prisma.externalVisitor.create({
				data: {
					email,
					name: data.name,
					rut: data.rut,
					companyId: visitorTalk.companyId,
				},
			})
		}

		return {
			success: true,
			message: "Datos actualizados exitosamente",
			visitorId: visitor.id,
		}
	} catch (error) {
		console.error("Error updating external user data:", error)
		return {
			success: false,
			error: "Error al actualizar los datos",
		}
	}
}
