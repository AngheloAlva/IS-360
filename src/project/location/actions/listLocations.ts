"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function listLocations() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return { ok: false as const, message: "No autorizado", data: null }
	}

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				location: ["list"],
			},
		},
	})

	if (!hasPermission) {
		return { ok: false as const, message: "No autorizado", data: null }
	}

	const locations = await prisma.location.findMany({
		select: {
			id: true,
			name: true,
			parentId: true,
			path: true,
			_count: { select: { equipment: true } },
		},
		orderBy: { path: "asc" },
	})

	const data = locations.map((l) => ({
		id: l.id,
		name: l.name,
		parentId: l.parentId,
		path: l.path,
		equipmentCount: l._count.equipment,
	}))

	return { ok: true as const, data }
}

export type LocationItem = {
	id: string
	name: string
	parentId: string | null
	path: string
	equipmentCount: number
}
