"use server"

import { z } from "zod"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

const approveSafetyTalkSchema = z.object({
	safetyTalkId: z.string(),
})

export async function approveSafetyTalk(data: z.infer<typeof approveSafetyTalkSchema>) {
	const session = await auth.api.getSession({
		headers: new Headers({
			"content-type": "application/json",
		}),
	})

	if (!session?.user) {
		throw new Error("No autorizado")
	}

	const validatedData = approveSafetyTalkSchema.parse(data)

	const safetyTalk = await prisma.userSafetyTalk.findUnique({
		where: {
			id: validatedData.safetyTalkId,
		},
		select: {
			status: true,
			score: true,
			minRequiredScore: true,
		},
	})

	if (!safetyTalk) {
		throw new Error("Charla de seguridad no encontrada")
	}

	if (safetyTalk.status !== "PASSED") {
		throw new Error("La charla debe estar en estado PASSED para ser aprobada manualmente")
	}

	if (!safetyTalk.score || safetyTalk.score < safetyTalk.minRequiredScore) {
		throw new Error("El puntaje no cumple con el mínimo requerido")
	}

	const updatedSafetyTalk = await prisma.userSafetyTalk.update({
		where: {
			id: validatedData.safetyTalkId,
		},
		data: {
			status: "MANUALLY_APPROVED",
			approvalById: session.user.id,
			updatedAt: new Date(),
		},
	})

	return updatedSafetyTalk
}
