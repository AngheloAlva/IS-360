"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import {
	safetyTalkSchema,
	type SafetyTalkSchema,
} from "@/project/safety-talk/schemas/safety-talk.schema"

interface CreateSafetyTalkProps {
	data: SafetyTalkSchema
	slug: string
}

export async function createSafetyTalk({
	data,
	slug,
}: CreateSafetyTalkProps): Promise<{ ok: boolean; message: string }> {
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
		const validatedData = safetyTalkSchema.parse(data)

		const safetyTalk = await prisma.safetyTalk.create({
			data: {
				title: validatedData.title,
				slug: slug,
				description: validatedData.description,
				isPresential: validatedData.isPresential,
				timeLimit: validatedData.timeLimit ? +validatedData.timeLimit : null,
				minimumScore: +validatedData.minimumScore,
				expiresAt: validatedData.expiresAt,
				resources: {
					create: validatedData.resources.map((resource) => ({
						type: resource.type,
						title: resource.title,
						url: resource.url ?? "",
						fileSize: resource.fileSize,
						mimeType: resource.mimeType,
						order: 0,
					})),
				},
				questions: {
					create: validatedData.questions.map((question) => ({
						type: question.type,
						question: question.question,
						imageUrl: question.imageUrl,
						description: question.description,
						options: {
							create: question.options.map((option) => ({
								text: option.text,
								isCorrect: option.isCorrect,
								zoneLabel: option.zoneLabel,
								zoneId: option.zoneId,
								order: option.order ? parseInt(option.order) : 0,
							})),
						},
					})),
				},
			},
		})

		if (!safetyTalk) {
			throw new Error("No se pudo crear la charla de seguridad")
		}

		logActivity({
			userId: session.user.id,
			module: MODULES.SAFETY_TALK,
			action: ACTIVITY_TYPE.CREATE,
			entityId: safetyTalk.id,
			entityType: "SafetyTalk",
			metadata: {
				title: safetyTalk.title,
				slug: safetyTalk.slug,
				isPresential: safetyTalk.isPresential,
				timeLimit: safetyTalk.timeLimit,
				minimumScore: safetyTalk.minimumScore,
				expiresAt: safetyTalk.expiresAt?.toISOString(),
				resourcesCount: validatedData.resources.length,
				questionsCount: validatedData.questions.length,
			},
		})

		return {
			ok: true,
			message: "Charla de seguridad creada exitosamente",
		}
	} catch (error) {
		console.error("[CREATE_SAFETY_TALK]", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al crear la charla de seguridad",
		}
	}
}
