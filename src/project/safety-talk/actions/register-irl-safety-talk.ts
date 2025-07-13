"use server"

import { headers } from "next/headers"
import { z } from "zod"

import { irlSafetyTalkSchema, type IrlSafetyTalkSchema } from "../schemas/irl-safety-talk.schema"
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

		const results = await Promise.all(
			validatedData.employees.map(async (employee) => {
				if (employee.talksId) {
					const updatedSafetyTalk = await prisma.userSafetyTalk.update({
						where: {
							id: employee.talksId,
						},
						data: {
							approvalById: session.user.id,
							expiresAt: employee.expiresAt,
							score: parseInt(employee.score),
							completedAt: employee.sessionDate,
							manuallyApproved: employee.approved,
							inPersonSessionDate: employee.sessionDate,
							status: employee.approved ? "PASSED" : "FAILED",
						},
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
						expiresAt: {
							gt: new Date(),
						},
					},
				})

				if (existingSafetyTalk) {
					const updatedSafetyTalk = await prisma.userSafetyTalk.update({
						where: {
							id: existingSafetyTalk.id,
						},
						data: {
							approvalById: session.user.id,
							expiresAt: employee.expiresAt,
							score: parseInt(employee.score),
							completedAt: employee.sessionDate,
							manuallyApproved: employee.approved,
							inPersonSessionDate: employee.sessionDate,
							status: employee.approved ? "PASSED" : "FAILED",
						},
					})

					return {
						userId: employee.userId,
						action: "updated",
						safetyTalkId: updatedSafetyTalk.id,
					}
				} else {
					const newSafetyTalk = await prisma.userSafetyTalk.create({
						data: {
							category: "IRL",
							currentAttempts: 1,
							userId: employee.userId,
							expiresAt: employee.expiresAt,
							approvalById: session.user.id,
							score: parseInt(employee.score),
							completedAt: employee.sessionDate,
							manuallyApproved: employee.approved,
							inPersonSessionDate: employee.sessionDate,
							status: employee.approved ? "PASSED" : "FAILED",
						},
					})

					return {
						userId: employee.userId,
						action: "created",
						safetyTalkId: newSafetyTalk.id,
					}
				}
			})
		)

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
				errors: error.errors,
			}
		}

		return {
			ok: false,
			message: "Error al procesar los registros de charlas IRL",
		}
	}
}
