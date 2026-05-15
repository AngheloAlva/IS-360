"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { UnblockUserSchema } from "../schemas/attempt.schema"
import { logActivity } from "@/lib/activity/log"
import { ACTIVITY_SEVERITY, ACTIVITY_TYPE, MODULES, SAFETY_TALK_CATEGORY } from "@/generated/prisma/enums"
import { createDiff } from "@/lib/activity/diff"

export async function unblockUser(data: unknown) {
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

		// Verificar que sea administrador
		if (session.user.accessRole !== "ADMIN") {
			return {
				success: false,
				error: "No tienes permisos para desbloquear usuarios",
			}
		}

		const validatedData = UnblockUserSchema.parse(data)
		const { userId, category, reason } = validatedData

		// Buscar UserSafetyTalk
		const userSafetyTalk = await prisma.userSafetyTalk.findFirst({
			where: {
				userId,
				category: category,
			},
		})

		if (!userSafetyTalk) {
			return {
				success: false,
				error: "No se encontró el registro de la charla",
			}
		}

		if (userSafetyTalk.status !== "BLOCKED") {
			return {
				success: false,
				error: "El usuario no está bloqueado",
			}
		}

		// Desbloquear usuario - resetear intentos y estado
		await prisma.userSafetyTalk.update({
			where: { id: userSafetyTalk.id },
			data: {
				status: "PENDING",
				currentAttempts: 0,
				nextAttemptAt: null,
			},
		})

		const diff = createDiff(
			{ status: "BLOCKED", currentAttempts: userSafetyTalk.currentAttempts },
			{ status: "PENDING", currentAttempts: 0 }
		)

  await logActivity({
			userId: session.user.id,
			module: MODULES.SAFETY_TALK,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: userSafetyTalk.id,
			entityType: "UserSafetyTalk",
			severity: ACTIVITY_SEVERITY.HIGH,
			...diff,
			metadata: {
				unblocked: true,
				targetUserId: userId,
				category,
				reason,
			},
		})

		return {
			success: true,
			message: "Usuario desbloqueado exitosamente",
		}
	} catch (error) {
		console.error("Error unblocking user:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Error al desbloquear usuario",
		}
	}
}

export async function getUserSafetyTalkStatus(userId: string, category: SAFETY_TALK_CATEGORY) {
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

		const canAccessRequestedUser = session.user.id === userId || session.user.accessRole === "ADMIN"

		if (!canAccessRequestedUser) {
			return {
				success: false,
				error: "No autorizado para consultar este estado",
			}
		}

		const userSafetyTalk = await prisma.userSafetyTalk.findFirst({
			where: {
				userId,
				category: category,
			},
			include: {
				attempts: {
					orderBy: {
						attemptNumber: "desc",
					},
					take: 3,
				},
			},
		})

		if (!userSafetyTalk) {
			return {
				success: true,
				status: null,
				message: "No ha iniciado esta charla",
			}
		}

		return {
			success: true,
			status: {
				id: userSafetyTalk.id,
				status: userSafetyTalk.status,
				currentAttempts: userSafetyTalk.currentAttempts,
				nextAttemptAt: userSafetyTalk.nextAttemptAt,
				score: userSafetyTalk.score,
				completedAt: userSafetyTalk.completedAt,
				expiresAt: userSafetyTalk.expiresAt,
			},
		}
	} catch (error) {
		console.error("Error getting user safety talk status:", error)
		return {
			success: false,
			error: "Error al obtener el estado",
		}
	}
}
