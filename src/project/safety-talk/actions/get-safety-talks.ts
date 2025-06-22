"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
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

	const safetyTalks = await prisma.safetyTalk.findMany({
		include: {
			resources: true,
			questions: {
				include: {
					options: true,
				},
			},
		},
		cacheStrategy: {
			ttl: 10,
			swr: 10,
		},
	})

	logActivity({
		userId: session.user.id,
		module: MODULES.SAFETY_TALK,
		action: ACTIVITY_TYPE.VIEW,
		entityId: "all",
		entityType: "SafetyTalk",
		metadata: {
			count: safetyTalks.length,
		},
	})

	return safetyTalks
}

export async function getSafetyTalkBySlug(slug: string) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return null
	}

	const safetyTalk = await prisma.safetyTalk.findUnique({
		where: { slug },
		include: {
			resources: true,
			questions: {
				include: {
					options: true,
				},
			},
			_count: {
				select: {
					questions: true,
					userSafetyTalks: true,
				},
			},
		},
		cacheStrategy: {
			ttl: 10,
			swr: 10,
		},
	})

	if (!safetyTalk) {
		return null
	}

	logActivity({
		userId: session.user.id,
		module: MODULES.SAFETY_TALK,
		action: ACTIVITY_TYPE.VIEW,
		entityId: safetyTalk.id,
		entityType: "SafetyTalk",
		metadata: {
			title: safetyTalk.title,
			slug: safetyTalk.slug,
			questionsCount: safetyTalk._count.questions,
			userSafetyTalksCount: safetyTalk._count.userSafetyTalks,
		},
	})

	return safetyTalk
}

export async function deleteSafetyTalk(id: string) {
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
		const safetyTalk = await prisma.safetyTalk.delete({
			where: { id },
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.SAFETY_TALK,
			action: ACTIVITY_TYPE.DELETE,
			entityId: safetyTalk.id,
			entityType: "SafetyTalk",
			metadata: {
				title: safetyTalk.title,
				slug: safetyTalk.slug,
			},
		})

		revalidatePath("/dashboard/charlas-de-seguridad")

		return {
			ok: true,
			message: "Charla de seguridad eliminada exitosamente",
		}
	} catch (error) {
		console.error("[DELETE_SAFETY_TALK]", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al eliminar la charla de seguridad",
		}
	}
}
