"use server"

import { headers } from "next/headers"
import { z } from "zod"

import { irlSafetyTalkSchema, type IrlSafetyTalkSchema } from "../schemas/irl-safety-talk.schema"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function registerIrlSafetyTalk(data: IrlSafetyTalkSchema) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const validatedData = irlSafetyTalkSchema.parse(data)

		const approvedEmployees = validatedData.employees.filter((e) => e.approved)

		if (approvedEmployees.length === 0) {
			return { ok: false, message: "No hay empleados aprobados para registrar" }
		}

		const results = await Promise.all(
			approvedEmployees.map(async (employee) => {
				const safetyTalkData = {
					approvalById: session.user.id,
					expiresAt: employee.expiresAt!,
					score: parseInt(employee.score!),
					completedAt: employee.sessionDate!,
					manuallyApproved: true,
					inPersonSessionDate: employee.sessionDate!,
					status: "PASSED" as const,
				}

				if (employee.talksId) {
					const updatedSafetyTalk = await prisma.userSafetyTalk.update({
						where: { id: employee.talksId },
						data: safetyTalkData,
					})

					return {
						userId: employee.userId,
						action: "updated",
						safetyTalkId: updatedSafetyTalk.id,
					}
				}

				// Si no hay talksId, buscar si existe un registro activo
				const existingSafetyTalk = await prisma.userSafetyTalk.findFirst({
					where: {
						category: "IRL",
						userId: employee.userId,
						expiresAt: { gt: new Date() },
					},
				})

				if (existingSafetyTalk) {
					const updatedSafetyTalk = await prisma.userSafetyTalk.update({
						where: { id: existingSafetyTalk.id },
						data: safetyTalkData,
					})

					return {
						userId: employee.userId,
						action: "updated",
						safetyTalkId: updatedSafetyTalk.id,
					}
				}

				const newSafetyTalk = await prisma.userSafetyTalk.create({
					data: {
						category: "IRL",
						currentAttempts: 1,
						userId: employee.userId,
						...safetyTalkData,
					},
				})

				return {
					userId: employee.userId,
					action: "created",
					safetyTalkId: newSafetyTalk.id,
				}
			})
		)

		for (const result of results) {
			await logActivity({
				userId: session.user.id,
				module: MODULES.SAFETY_TALK,
				action: ACTIVITY_TYPE.CREATE,
				entityId: result.safetyTalkId,
				entityType: "UserSafetyTalk",
				metadata: {
					category: "IRL",
					action: result.action,
					targetUserId: result.userId,
					manuallyApproved: true,
				},
			})
		}

		return {
			ok: true,
			message: "Registros de charlas IRL procesados correctamente",
			results,
		}
	} catch (error) {
		console.error("Error al registrar charlas IRL:", error)

		if (error instanceof z.ZodError) {
			return {
				ok: false,
				message: "Datos inválidos",
				errors: error.issues,
			}
		}

		return {
			ok: false,
			message: "Error al procesar los registros de charlas IRL",
		}
	}
}
