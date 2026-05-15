"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

import { updateLocationSchema } from "@/project/location/schemas/location.schema"
import type { UpdateLocationInput } from "@/project/location/schemas/location.schema"
import { recomputeSubtreePaths } from "@/project/location/actions/_helpers/recompute-subtree-paths"
import type { PrismaClientKnownRequestError } from "@prisma/client/runtime/client"

export async function updateLocation(input: UpdateLocationInput) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return { ok: false, message: "No autorizado" }
	}

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				location: ["update"],
			},
		},
	})

	if (!hasPermission) {
		return { ok: false, message: "No autorizado" }
	}

	const parsed = updateLocationSchema.safeParse(input)
	if (!parsed.success) {
		return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos" }
	}

	const { id, name, parentId } = parsed.data

	try {
		const result = await prisma.$transaction(
			async (tx) => {
				const current = await tx.location.findUniqueOrThrow({
					where: { id },
					select: { id: true, name: true, parentId: true, path: true },
				})

				const nameChanged = name !== undefined && name !== current.name
				const parentChanged = parentId !== undefined && parentId !== current.parentId

				const effectiveName = name ?? current.name
				const effectiveParentId = parentChanged ? parentId : current.parentId

				if (parentChanged && effectiveParentId !== null) {
					if (effectiveParentId === id) {
						return { ok: false, message: "Una ubicación no puede ser su propio padre" }
					}

					const cycleCheck = await tx.$queryRaw<{ would_cycle: boolean }[]>`
						WITH RECURSIVE ancestors AS (
							SELECT id, "parentId" FROM "Location" WHERE id = ${effectiveParentId}
							UNION ALL
							SELECT l.id, l."parentId" FROM "Location" l
							JOIN ancestors a ON l.id = a."parentId"
						)
						SELECT EXISTS (SELECT 1 FROM ancestors WHERE id = ${id}) AS would_cycle
					`

					if (cycleCheck[0]?.would_cycle) {
						return { ok: false, message: "No se puede mover una ubicación dentro de sus propios descendientes" }
					}
				}

				if (nameChanged || parentChanged) {
					const siblingParentId = parentChanged ? effectiveParentId : current.parentId

					const sibling = await tx.location.findFirst({
						where: {
							parentId: siblingParentId ?? null,
							name: { equals: effectiveName, mode: "insensitive" },
							id: { not: id },
						},
					})

					if (sibling) {
						return {
							ok: false,
							message: `Ya existe una ubicación con el nombre "${effectiveName}" en este nivel`,
						}
					}

					await tx.location.update({
						where: { id },
						data: {
							...(nameChanged ? { name: effectiveName } : {}),
							...(parentChanged ? { parentId: effectiveParentId } : {}),
						},
					})

					await recomputeSubtreePaths(tx, id)
				}

				const updated = await tx.location.findUniqueOrThrow({ where: { id } })
				return { ok: true, data: updated }
			},
			{ timeout: 30_000 },
		)

		if (result.ok) {
			revalidatePath("/admin/dashboard/ubicaciones")
			revalidatePath("/admin/dashboard/equipos")
		}

		return result
	} catch (error) {
		if ((error as PrismaClientKnownRequestError).code === "P2002") {
			return { ok: false, message: "Ya existe una ubicación con ese nombre en este nivel" }
		}
		return { ok: false, message: "Error al actualizar la ubicación" }
	}
}
