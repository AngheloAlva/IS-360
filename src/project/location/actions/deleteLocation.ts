"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

import { deleteLocationSchema } from "@/project/location/schemas/location.schema"
import type { DeleteLocationInput } from "@/project/location/schemas/location.schema"

export async function deleteLocation(input: DeleteLocationInput) {
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
				location: ["delete"],
			},
		},
	})

	if (!hasPermission) {
		return { ok: false, message: "No autorizado" }
	}

	const parsed = deleteLocationSchema.safeParse(input)
	if (!parsed.success) {
		return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos" }
	}

	const { id } = parsed.data

	try {
		const location = await prisma.location.findUnique({
			where: { id },
			select: { id: true, name: true, parentId: true },
		})

		if (!location) {
			return { ok: false, message: "La ubicación no existe" }
		}

		if (location.name === "Sin ubicación" && location.parentId === null) {
			return { ok: false, message: 'No se puede eliminar la ubicación sentinel "Sin ubicación"' }
		}

		const childrenCount = await prisma.location.count({
			where: { parentId: id },
		})

		if (childrenCount > 0) {
			return {
				ok: false,
				message: `No se puede eliminar: tiene ${childrenCount} ubicación${childrenCount === 1 ? "" : "es"} hija${childrenCount === 1 ? "" : "s"}`,
			}
		}

		const equipmentCount = await prisma.equipment.count({
			where: { locationId: id },
		})

		if (equipmentCount > 0) {
			return {
				ok: false,
				message: `No se puede eliminar: tiene ${equipmentCount} equipo${equipmentCount === 1 ? "" : "s"} asignado${equipmentCount === 1 ? "" : "s"}`,
			}
		}

		await prisma.location.delete({ where: { id } })

		revalidatePath("/admin/dashboard/ubicaciones")
		revalidatePath("/admin/dashboard/equipos")

		return { ok: true }
	} catch {
		return { ok: false, message: "Error al eliminar la ubicación" }
	}
}
