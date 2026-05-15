"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { assertCanRevokeFor, ForbiddenError } from "@/project/worker-compliance/lib/permissions"

export async function revokeWorkerQRToken(workerId: string): Promise<void> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		throw new ForbiddenError("No autenticado")
	}

	await assertCanRevokeFor(session.user, workerId)

	await prisma.workerQRToken.updateMany({
		where: {
			workerId,
			revokedAt: null,
		},
		data: { revokedAt: new Date() },
	})
}
