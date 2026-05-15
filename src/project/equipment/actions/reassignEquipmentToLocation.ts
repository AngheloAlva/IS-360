"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface ReassignEquipmentToLocationInput {
	id: string
	locationId: string
	clearParent: boolean
}

export async function reassignEquipmentToLocation({
	id,
	locationId,
	clearParent,
}: ReassignEquipmentToLocationInput) {
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
				equipment: ["update"],
			},
		},
	})

	if (!hasPermission) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const [location, equipment] = await Promise.all([
			prisma.location.findUnique({ where: { id: locationId }, select: { id: true } }),
			prisma.equipment.findUnique({ where: { id }, select: { id: true, parentId: true } }),
		])

		if (!location) {
			return { ok: false, message: "La ubicación no existe" }
		}

		if (!equipment) {
			return { ok: false, message: "El equipo no existe" }
		}

		const data = await prisma.equipment.update({
			where: { id },
			data: {
				locationId,
				...(clearParent && { parentId: null }),
			},
		})

		revalidatePath("/admin/dashboard/equipos")
		revalidatePath("/admin/dashboard/ubicaciones")

		return { ok: true, data }
	} catch {
		return { ok: false, message: "Error al reasignar el equipo" }
	}
}
