"use server"

import type { ExternalUserSchema } from "@/lib/form-schemas/admin/user/externalUser.schema"
import type { InternalUserSchema } from "@/lib/form-schemas/admin/user/internalUser.schema"

import prisma from "@/lib/prisma"

interface UpdateExternalUserProps {
	userId: string
	values: ExternalUserSchema
}

export const updateExternalUser = async ({ userId, values }: UpdateExternalUserProps) => {
	try {
		const user = await prisma.user.update({
			where: {
				id: userId,
			},
			data: values,
		})

		return {
			ok: true,
			data: user,
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al actualizar el usuario",
		}
	}
}

interface UpdateInternalUserProps {
	userId: string
	values: InternalUserSchema
}

export const updateInternalUser = async ({ userId, values }: UpdateInternalUserProps) => {
	try {
		const user = await prisma.user.update({
			where: {
				id: userId,
			},
			data: values,
		})

		return {
			ok: true,
			data: user,
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al actualizar el usuario",
		}
	}
}
