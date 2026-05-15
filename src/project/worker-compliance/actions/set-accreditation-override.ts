"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { ForbiddenError } from "@/project/worker-compliance/lib/permissions"
import { ACCESS_ROLE } from "@/generated/prisma/enums"

export async function setAccreditationOverride(
	workerId: string,
	value: boolean | null
): Promise<void> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		throw new ForbiddenError("No autenticado")
	}

	if (session.user.accessRole !== (ACCESS_ROLE.ADMIN as string)) {
		throw new ForbiddenError()
	}

	const result = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: { workerCompliance: ["generate-qr"] },
		},
	})

	if (!result.success) {
		throw new ForbiddenError()
	}

	await prisma.user.update({
		where: { id: workerId },
		data: { accreditationOverride: value },
		select: { id: true },
	})
}
