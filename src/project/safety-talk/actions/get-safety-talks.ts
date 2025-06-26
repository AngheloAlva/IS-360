"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES, SAFETY_TALK_CATEGORY } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function getSafetyTalks() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return null
	}

	// Get user's safety talks
	const userSafetyTalks = await prisma.userSafetyTalk.findMany({
		where: {
			userId: session.user.id,
		},
		include: {
			approvalBy: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	})

	logActivity({
		userId: session.user.id,
		module: MODULES.SAFETY_TALK,
		action: ACTIVITY_TYPE.VIEW,
		entityId: "all",
		entityType: "UserSafetyTalk",
		metadata: {
			count: userSafetyTalks.length,
		},
	})

	return userSafetyTalks
}

export async function getSafetyTalkByCategory(category: SAFETY_TALK_CATEGORY) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return null
	}

	// Get user's latest attempt for this category
	const userSafetyTalk = await prisma.userSafetyTalk.findFirst({
		where: {
			userId: session.user.id,
			category,
		},
		include: {
			approvalBy: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	})

	if (userSafetyTalk) {
		logActivity({
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
