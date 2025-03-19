"use server"

import type { ExternalUserSchema } from "@/lib/form-schemas/admin/user/externalUser.schema"

import prisma from "@/lib/prisma"

interface updateUserProps {
	userId: string
	values: ExternalUserSchema
}

export const updateUser = async ({ userId, values }: updateUserProps) => {
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
