"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

import { reassignEquipmentLocationSchema } from "@/project/location/schemas/location.schema"
import type { ReassignEquipmentLocationInput } from "@/project/location/schemas/location.schema"

export async function reassignEquipmentLocation(input: ReassignEquipmentLocationInput) {
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

	const parsed = reassignEquipmentLocationSchema.safeParse(input)
	if (!parsed.success) {
		return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos" }
	}

	const { equipmentId, locationId } = parsed.data

	try {
		const location = await prisma.location.findUnique({
			where: { id: locationId },
			select: { id: true },
		})

		if (!location) {
			return { ok: false, message: "La ubicación no existe" }
		}

		const equipment = await prisma.equipment.update({
			where: { id: equipmentId },
			data: { locationId },
		})

		revalidatePath("/admin/dashboard/equipos")
		revalidatePath("/admin/dashboard/ubicaciones")

		return { ok: true, data: equipment }
	} catch {
		return { ok: false, message: "Error al reasignar la ubicación del equipo" }
	}
}
