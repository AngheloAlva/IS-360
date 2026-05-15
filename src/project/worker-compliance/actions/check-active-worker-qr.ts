"use server"

import { headers } from "next/headers"

import { assertCanGenerateFor, ForbiddenError } from "@/project/worker-compliance/lib/permissions"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function checkActiveWorkerQR(workerId: string): Promise<{ hasActive: boolean }> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		throw new ForbiddenError("No autenticado")
	}

	await assertCanGenerateFor(session.user, workerId)

	const active = await prisma.workerQRToken.findFirst({
		where: { workerId, revokedAt: null },
		select: { id: true },
	})

	return { hasActive: active !== null }
}
