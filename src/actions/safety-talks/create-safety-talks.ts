"use server"

import {
	type SafetyTalkSchema,
	safetyTalkSchema,
} from "@/lib/form-schemas/safety-talk/safety-talk.schema"
import prisma from "@/lib/prisma"

interface CreateSafetyTalkProps {
	data: SafetyTalkSchema
	slug: string
}

export async function createSafetyTalk({
	data,
	slug,
}: CreateSafetyTalkProps): Promise<{ ok: boolean; message: string }> {
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

		return {
			ok: true,
			message: "Charla de seguridad creada exitosamente",
		}
	} catch (error) {
		console.log(error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al crear la charla de seguridad",
		}
	}
}
