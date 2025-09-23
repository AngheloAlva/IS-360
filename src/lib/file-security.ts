import { headers } from "next/headers"

import { ACCESS_ROLE } from "@prisma/client"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export interface FileAccessContext {
	filename: string
	containerType: "documents" | "files" | "startup" | "avatars" | "equipment"
	action: "read" | "write" | "readwrite"
	companyId?: string
}

export interface SecurityValidationResult {
	allowed: boolean
	reason?: string
	userId?: string
	companyId?: string
	accessRole?: ACCESS_ROLE
}

export async function validateFileAccess(
	context: FileAccessContext
): Promise<SecurityValidationResult> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user?.id) {
			return { allowed: false, reason: "Usuario no autenticado" }
		}

		const userId = session.user.id
		const userCompanyId = session.user.companyId || undefined
		const accessRole = (session.user.accessRole as ACCESS_ROLE) || "PARTNER_COMPANY"

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				companyId: true,
				accessRole: true,
				documentAreas: true,
				area: true,
				isActive: true,
				banned: true,
			},
		})

		if (!user || !user.isActive || user.banned) {
			return { allowed: false, reason: "Usuario inactivo o baneado" }
		}

		switch (context.containerType) {
			case "avatars":
				return { allowed: true, userId, companyId: userCompanyId || undefined, accessRole }

			case "documents":
				if (accessRole === "ADMIN") {
					return { allowed: true, userId, companyId: userCompanyId, accessRole }
				}

				return { allowed: true, userId, companyId: userCompanyId, accessRole }

			case "startup":
			case "equipment":
				if (accessRole === "ADMIN") {
					return { allowed: true, userId, companyId: userCompanyId, accessRole }
				}

				return { allowed: true, userId, companyId: userCompanyId, accessRole }

			case "files":
				if (accessRole === "ADMIN") {
					return { allowed: true, userId, companyId: userCompanyId, accessRole }
				}

				return { allowed: true, userId, companyId: userCompanyId, accessRole }

			default:
				return { allowed: false, reason: "Tipo de contenedor no válido" }
		}
	} catch (error) {
		console.error("Error validando acceso a archivo:", error)
		return { allowed: false, reason: "Error interno del servidor" }
	}
}

export async function logFileAccess(
	context: FileAccessContext,
	validationResult: SecurityValidationResult,
	success: boolean
): Promise<void> {
	try {
		if (!validationResult.userId) return

		await prisma.fileAccessLog.create({
			data: {
				userId: validationResult.userId,
				filename: context.filename,
				containerType: context.containerType,
				action: context.action,
				companyId: context.companyId || validationResult.companyId,
				success,
				accessRole: validationResult.accessRole || "PARTNER_COMPANY",
				ipAddress: await getClientIpAddress(),
				userAgent: await getUserAgent(),
				timestamp: new Date(),
			},
		})
	} catch (error) {
		console.error("Error registrando acceso a archivo:", error)
	}
}

async function getClientIpAddress(): Promise<string | null> {
	try {
		const headersList = await headers()

		const forwarded = headersList.get("x-forwarded-for")
		const realIp = headersList.get("x-real-ip")
		const cfConnectingIp = headersList.get("cf-connecting-ip")

		return forwarded?.split(",")[0] || realIp || cfConnectingIp || null
	} catch (error) {
		console.error("Error obteniendo IP del cliente:", error)
		return null
	}
}

async function getUserAgent(): Promise<string | null> {
	try {
		const headersList = await headers()
		return headersList.get("user-agent")
	} catch (error) {
		console.error("Error obteniendo User-Agent:", error)
		return null
	}
}
