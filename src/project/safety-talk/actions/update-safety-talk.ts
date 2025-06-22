"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import {
	type SafetyTalkSchema,
	safetyTalkSchema,
} from "@/project/safety-talk/schemas/safety-talk.schema"

interface UpdateSafetyTalkProps {
	id: string
	data: SafetyTalkSchema
	slug: string
}

export async function updateSafetyTalk({
	id,
	data,
	slug,
}: UpdateSafetyTalkProps): Promise<{ ok: boolean; message: string }> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				safetyTalk: ["update"],
			},
		},
	})

	if (!hasPermission) {
		return {
			ok: false,
			message: "No tienes permisos para actualizar la charla de seguridad",
		}
	}

	try {
		const validatedData = safetyTalkSchema.parse(data)

		// Verificar que la charla exista
		const existingSafetyTalk = await prisma.safetyTalk.findUnique({
			where: { id },
			include: {
				resources: true,
				questions: {
					include: {
						options: true,
					},
				},
			},
		})

		if (!existingSafetyTalk) {
			return {
				ok: false,
				message: "La charla de seguridad no existe",
			}
		}

		// Actualizar recursos
		// Primero eliminar los recursos existentes
		await prisma.safetyTalkResource.deleteMany({
			where: { safetyTalkId: id },
		})

		// Actualizar preguntas y opciones
		// Primero eliminar las opciones existentes para evitar conflictos
		for (const question of existingSafetyTalk.questions) {
			await prisma.questionOption.deleteMany({
				where: { questionId: question.id },
			})
		}

		// Eliminar las preguntas existentes
		await prisma.question.deleteMany({
			where: { safetyTalkId: id },
		})

		// Actualizar la charla de seguridad
		const updatedSafetyTalk = await prisma.safetyTalk.update({
			where: { id },
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

		if (!updatedSafetyTalk) {
			throw new Error("No se pudo actualizar la charla de seguridad")
		}

		logActivity({
			userId: session.user.id,
			module: MODULES.SAFETY_TALK,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: updatedSafetyTalk.id,
			entityType: "SafetyTalk",
			metadata: {
				title: updatedSafetyTalk.title,
				slug: updatedSafetyTalk.slug,
				isPresential: updatedSafetyTalk.isPresential,
				timeLimit: updatedSafetyTalk.timeLimit,
				minimumScore: updatedSafetyTalk.minimumScore,
				expiresAt: updatedSafetyTalk.expiresAt?.toISOString(),
				resourcesCount: validatedData.resources.length,
				questionsCount: validatedData.questions.length,
			},
		})

		// Revalidar las rutas relevantes
		revalidatePath("/admin/dashboard/charlas-de-seguridad")
		revalidatePath(`/admin/dashboard/charlas-de-seguridad/${slug}`)

		return {
			ok: true,
			message: "Charla de seguridad actualizada exitosamente",
		}
	} catch (error) {
		console.error("[UPDATE_SAFETY_TALK]", error)
		return {
			ok: false,
			message:
				error instanceof Error ? error.message : "Error al actualizar la charla de seguridad",
		}
	}
}
