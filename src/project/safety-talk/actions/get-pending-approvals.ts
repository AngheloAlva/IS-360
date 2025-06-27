"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function getPendingApprovals() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		throw new Error("No autorizado")
	}

	const pendingApprovals = await prisma.userSafetyTalk.findMany({
		where: {
			status: "PASSED",
		},
		select: {
			id: true,
			category: true,
			status: true,
			score: true,
			completedAt: true,
			user: {
				select: {
					name: true,
					email: true,
				},
			},
		},
		orderBy: {
			completedAt: "desc",
		},
	})

	return pendingApprovals
}
