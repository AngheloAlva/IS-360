import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const { id } = await params

		const equipment = await prisma.equipment.findUnique({
			where: {
				id,
			},
			include: {
				parent: {
					select: {
						id: true,
						name: true,
						tag: true,
					},
				},
				attachments: true,
				_count: {
					select: {
						children: true,
						workOrders: true,
					},
				},
			},
		})

		if (!equipment) {
			return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 })
		}

		return NextResponse.json(equipment)
	} catch (error) {
		console.error("[EQUIPMENT_GET_BY_ID]", error)
		return NextResponse.json({ error: "Error al obtener el equipo" }, { status: 500 })
	}
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return NextResponse.json({ error: "No autorizado", code: "UNAUTHORIZED" }, { status: 401 })
	}

	try {
		const { id } = await params
		const body = await req.json()
		const { parentId } = body as { parentId: string | null }

		const equipment = await prisma.equipment.findUnique({
			where: { id },
			select: { id: true },
		})

		if (!equipment) {
			return NextResponse.json({ error: "Equipo no encontrado", code: "NOT_FOUND" }, { status: 404 })
		}

		if (parentId === id) {
			return NextResponse.json(
				{ error: "Un equipo no puede ser su propio padre", code: "SELF_REFERENCE" },
				{ status: 400 }
			)
		}

		if (parentId !== null && parentId !== undefined) {
			const parentExists = await prisma.equipment.findUnique({
				where: { id: parentId },
				select: { id: true },
			})

			if (!parentExists) {
				return NextResponse.json(
					{ error: "Equipo padre no encontrado", code: "PARENT_NOT_FOUND" },
					{ status: 404 }
				)
			}

			let cursor: string | null = parentId
			let iterations = 0
			while (cursor !== null && iterations < 100) {
				if (cursor === id) {
					return NextResponse.json(
						{ error: "Operación no permitida: generaría un ciclo en la jerarquía", code: "CYCLE_DETECTED" },
						{ status: 409 }
					)
				}
				const ancestor: { parentId: string | null } | null = await prisma.equipment.findUnique({
					where: { id: cursor },
					select: { parentId: true },
				})
				cursor = ancestor?.parentId ?? null
				iterations++
			}
		}

		const updated = await prisma.equipment.update({
			where: { id },
			data: { parentId: parentId ?? null },
			include: {
				parent: {
					select: {
						id: true,
						name: true,
						tag: true,
					},
				},
				_count: {
					select: {
						children: true,
						workOrders: true,
					},
				},
			},
		})

		return NextResponse.json(updated)
	} catch (error) {
		console.error("[EQUIPMENT_PATCH_BY_ID]", error)
		return NextResponse.json({ error: "Error al actualizar el equipo" }, { status: 500 })
	}
}
