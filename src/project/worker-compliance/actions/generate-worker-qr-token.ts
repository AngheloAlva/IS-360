"use server"

import { headers } from "next/headers"

import { assertCanGenerateFor, ForbiddenError } from "@/project/worker-compliance/lib/permissions"
import { randomToken, sha256Hex } from "@/project/worker-compliance/lib/token"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function generateWorkerQRToken(
	workerId: string,
	options: { force?: boolean } = {}
): Promise<{ token: string; url: string }> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		throw new ForbiddenError("No autenticado")
	}

	await assertCanGenerateFor(session.user, workerId)

	if (!options.force) {
		const existing = await prisma.workerQRToken.findFirst({
			where: { workerId, revokedAt: null },
			select: { id: true },
		})

		if (existing) {
			throw new Error("Ya existe un QR activo para este trabajador")
		}
	}

	const plaintext = randomToken()
	const tokenHash = sha256Hex(plaintext)

	await prisma.$transaction([
		prisma.workerQRToken.updateMany({
			where: { workerId, revokedAt: null },
			data: { revokedAt: new Date() },
		}),
		prisma.workerQRToken.create({
			data: {
				workerId,
				tokenHash,
				createdById: session.user.id,
			},
		}),
	])

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ""
	const url = `${baseUrl}/acreditacion/${plaintext}`

	return { token: plaintext, url }
}
