"use server"

import { renderToBuffer } from "@react-pdf/renderer"
import { SafetyTalkCertificate } from "../utils/certificate-generator"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function generateCertificate(userSafetyTalkId: string) {
	try {
		const session = await auth.api.getSession({
			headers: await import("next/headers").then((mod) => mod.headers()),
		})

		if (!session?.user?.id) {
			return {
				success: false,
				error: "No autenticado",
			}
		}

		const userSafetyTalk = await prisma.userSafetyTalk.findUnique({
			where: { id: userSafetyTalkId },
			include: {
				user: {
					include: {
						company: true,
					},
				},
			},
		})

		if (!userSafetyTalk) {
			return {
				success: false,
				error: "Registro no encontrado",
			}
		}

		if (userSafetyTalk.userId !== session.user.id && session.user.accessRole !== "ADMIN") {
			return {
				success: false,
				error: "No tienes permisos para generar este certificado",
			}
		}

		if (userSafetyTalk.status !== "PASSED") {
			return {
				success: false,
				error: "La charla no ha sido aprobada",
			}
		}

		if (userSafetyTalk.expiresAt && userSafetyTalk.expiresAt < new Date()) {
			return {
				success: false,
				error: "El certificado ha expirado",
			}
		}

		const pdfBuffer = await renderToBuffer(
			SafetyTalkCertificate({
				rut: userSafetyTalk.user.rut,
				name: userSafetyTalk.user.name,
				score: userSafetyTalk.score || 0,
				category: userSafetyTalk.category,
				expiresAt: userSafetyTalk.expiresAt || new Date(),
				completedAt: userSafetyTalk.completedAt || new Date(),
				companyName: userSafetyTalk.user.company?.name || "Oleoducto Trasandino Chile",
			})
		)

		const base64 = pdfBuffer.toString("base64")

		return {
			success: true,
			pdf: base64,
			filename: `certificado-${userSafetyTalk.category}-${userSafetyTalk.user.rut}.pdf`,
		}
	} catch (error) {
		console.error("Error generating certificate:", error)
		return {
			success: false,
			error: "Error al generar el certificado",
		}
	}
}

export async function generateExternalCertificate(token: string, email: string) {
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

		const visitor = await prisma.externalVisitor.findFirst({
			where: {
				email,
				companyId: visitorTalk.companyId,
			},
		})

		if (!visitor) {
			return {
				success: false,
				error: "Usuario no encontrado",
			}
		}

		const completion = await prisma.visitorTalkCompletion.findUnique({
			where: {
				visitorId_visitorTalkId: {
					visitorId: visitor.id,
					visitorTalkId: visitorTalk.id,
				},
			},
		})

		if (!completion) {
			return {
				success: false,
				error: "No se encontró el registro de evaluación",
			}
		}

		if (completion.status !== "COMPLETED" || !completion.passed) {
			return {
				success: false,
				error: "La evaluación no ha sido aprobada",
			}
		}

		const pdfBuffer = await renderToBuffer(
			SafetyTalkCertificate({
				rut: visitor.rut || "externo",
				score: completion.score || 0,
				category: visitorTalk.category,
				name: visitor.name || "Usuario Externo",
				completedAt: completion.completedAt || new Date(),
				companyName: visitorTalk.company.name || "Empresa Externa",
				expiresAt: new Date(
					new Date(completion.completedAt || new Date()).setFullYear(
						new Date(completion.completedAt || new Date()).getFullYear() + 1
					)
				),
			})
		)

		const base64 = pdfBuffer.toString("base64")

		return {
			success: true,
			pdf: base64,
			filename: `certificado-${visitorTalk.category}-${visitor.rut || "externo"}.pdf`,
		}
	} catch (error) {
		console.error("Error generating external certificate:", error)
		return {
			success: false,
			error: "Error al generar el certificado",
		}
	}
}
