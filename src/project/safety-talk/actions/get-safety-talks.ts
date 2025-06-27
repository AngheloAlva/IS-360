"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"
import { logActivity } from "@/lib/activity/log"
import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { SAFETY_TALK_CATEGORY } from "@prisma/client"

export async function getUserSafetyTalks() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		// Get user's safety talks
		const userSafetyTalks = await prisma.userSafetyTalk.findMany({
			where: {
				userId: session.user.id,
			},
			include: {
				approvalBy: {
					select: {
						name: true,
					},
				},
				attempts: {
					select: {
						id: true,
						score: true,
						completedAt: true,
					},
					orderBy: {
						completedAt: "desc",
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		})

		await logActivity({
			userId: session.user.id,
			module: MODULES.SAFETY_TALK,
			action: ACTIVITY_TYPE.VIEW,
			entityId: "all",
			entityType: "UserSafetyTalk",
			metadata: {
				count: userSafetyTalks.length,
			},
		})

		return { ok: true, safetyTalks: userSafetyTalks }
	} catch (error) {
		console.error(error)
		return { ok: false, message: "Error al obtener las charlas" }
	}
}

export async function getSafetyTalkByCategory(category: SAFETY_TALK_CATEGORY) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return null
	}

	try {
		// Get user's latest attempt for this category
		const userSafetyTalk = await prisma.userSafetyTalk.findFirst({
			where: {
				userId: session.user.id,
				category,
			},
			include: {
				approvalBy: {
					select: {
						name: true,
					},
				},
				attempts: {
					select: {
						id: true,
						score: true,
						completedAt: true,
					},
					orderBy: {
						completedAt: "desc",
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		})

		if (userSafetyTalk) {
			await logActivity({
				userId: session.user.id,
				module: MODULES.SAFETY_TALK,
				action: ACTIVITY_TYPE.VIEW,
				entityId: userSafetyTalk.id,
				entityType: "UserSafetyTalk",
				metadata: {
					category,
					status: userSafetyTalk.status,
					score: userSafetyTalk.score,
				},
			})
		}

		return userSafetyTalk
	} catch (error) {
		console.error(error)
		return null
	}
}

export async function deleteSafetyTalkAttempt(id: string) {
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
		const userSafetyTalk = await prisma.userSafetyTalk.delete({
			where: { id },
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.SAFETY_TALK,
			action: ACTIVITY_TYPE.DELETE,
			entityId: userSafetyTalk.id,
			entityType: "UserSafetyTalk",
			metadata: {
				category: userSafetyTalk.category,
				status: userSafetyTalk.status,
			},
		})

		revalidatePath("/dashboard/charlas-de-seguridad")

		return {
			ok: true,
			message: "Intento de charla eliminado exitosamente",
		}
	} catch (error) {
		console.error("[DELETE_SAFETY_TALK_ATTEMPT]", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al eliminar el intento de charla",
		}
	}
}
