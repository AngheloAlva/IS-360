"use server"

import type { ExternalUserSchema } from "@/features/user/schemas/externalUser.schema"
import type { InternalUserSchema } from "@/features/user/schemas/internalUser.schema"
import type { ProfileFormSchema } from "@/features/auth/schemas/profile.schema"

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
		const { role, ...rest } = values

		const user = await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				...rest,
				role: role.join(","),
			},
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

interface UpdateProfileProps {
	userId: string
	imageUrl?: string
	values: ProfileFormSchema
}

export const updateProfile = async ({ userId, imageUrl, values }: UpdateProfileProps) => {
	try {
		const user = await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				name: values.name,
				phone: values.phone,
				image: imageUrl || undefined,
			},
		})

		return {
			ok: true,
			data: user,
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al actualizar el perfil",
		}
	}
}
