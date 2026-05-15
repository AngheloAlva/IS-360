import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
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
		return new NextResponse("No autorizado", { status: 403 })
	}

	try {
		const locations = await prisma.location.findMany({
			select: {
				id: true,
				name: true,
				parentId: true,
				path: true,
				_count: { select: { equipment: { where: { parentId: null } } } },
			},
			orderBy: { path: "asc" },
		})

		// Sentinel "Sin ubicación" must count ALL its equipment regardless of parentId —
		// sub-equipment orphaned there are exactly the data-quality issues it exposes.
		const sentinel = locations.find((l) => l.name === "Sin ubicación" && l.parentId === null)
		const sentinelTotalCount = sentinel
			? await prisma.equipment.count({ where: { locationId: sentinel.id } })
			: 0

		const data = locations.map((l) => ({
			id: l.id,
			name: l.name,
			parentId: l.parentId,
			path: l.path,
			equipmentCount:
				l.id === sentinel?.id ? sentinelTotalCount : l._count.equipment,
		}))

		return NextResponse.json(data)
	} catch (error) {
		console.error("[LOCATIONS_GET]", error)
		return NextResponse.json({ error: "Error fetching locations" }, { status: 500 })
	}
}
