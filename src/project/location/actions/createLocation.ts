"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

import { createLocationSchema } from "@/project/location/schemas/location.schema"
import type { CreateLocationInput } from "@/project/location/schemas/location.schema"
import type { PrismaClientKnownRequestError } from "@prisma/client/runtime/client"

export async function createLocation(input: CreateLocationInput) {
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
				location: ["create"],
			},
		},
	})

	if (!hasPermission) {
		return { ok: false, message: "No autorizado" }
	}

	const parsed = createLocationSchema.safeParse(input)
	if (!parsed.success) {
		return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos" }
	}

	const { name, parentId } = parsed.data

	try {
		let path: string

		if (parentId) {
			const parent = await prisma.location.findUnique({
				where: { id: parentId },
				select: { path: true },
			})
			if (!parent) {
				return { ok: false, message: "La ubicación padre no existe" }
			}
			path = `${parent.path} / ${name}`
		} else {
			path = name
		}

		const sibling = await prisma.location.findFirst({
			where: {
				parentId: parentId ?? null,
				name: { equals: name, mode: "insensitive" },
			},
		})

		if (sibling) {
			return { ok: false, message: `Ya existe una ubicación con el nombre "${name}" en este nivel` }
		}

		const location = await prisma.location.create({
			data: { name, parentId: parentId ?? null, path },
		})

		revalidatePath("/admin/dashboard/ubicaciones")
		revalidatePath("/admin/dashboard/equipos")

		return { ok: true, data: location }
	} catch (error) {
		if ((error as PrismaClientKnownRequestError).code === "P2002") {
			return { ok: false, message: `Ya existe una ubicación con el nombre "${name}" en este nivel` }
		}
		return { ok: false, message: "Error al crear la ubicación" }
	}
}
