"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { ExternalUserSchema } from "@/project/user/schemas/externalUser.schema"
import type { InternalUserSchema } from "@/project/user/schemas/internalUser.schema"
import type { ProfileFormSchema } from "@/project/auth/schemas/profile.schema"

interface UpdateExternalUserProps {
	userId: string
	values: ExternalUserSchema
}

export const updateExternalUser = async ({ userId, values }: UpdateExternalUserProps) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const user = await prisma.user.update({
			where: {
				id: userId,
			},
			data: values,
			select: {
				id: true,
				email: true,
				name: true,
				companyId: true,
				isSupervisor: true,
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.USERS,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: user.id,
			entityType: "User",
			metadata: {
				email: user.email,
				name: user.name,
				companyId: user.companyId,
				updatedFields: Object.keys(values),
			},
		})

		return {
			ok: true,
			data: user,
		}
	} catch (error) {
		console.error("[UPDATE_EXTERNAL_USER]", error)
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
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const { role, allowedModules, ...rest } = values

		const user = await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				...rest,
				role: role.join(","),
				allowedModules: allowedModules,
			},
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				allowedModules: true,
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.USERS,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: user.id,
			entityType: "User",
			metadata: {
				email: user.email,
				name: user.name,
				role: user.role,
				allowedModules: user.allowedModules,
				updatedFields: [...Object.keys(rest), "role", "allowedModules"],
			},
		})

		return {
			ok: true,
			data: user,
		}
	} catch (error) {
		console.error("[UPDATE_INTERNAL_USER]", error)
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
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

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
			select: {
				id: true,
				email: true,
				name: true,
				phone: true,
				image: true,
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.USERS,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: user.id,
			entityType: "User",
			metadata: {
				email: user.email,
				name: user.name,
				phone: user.phone,
				image: user.image,
				updatedFields: Object.keys({ ...values, image: imageUrl }),
			},
		})

		return {
			ok: true,
			data: user,
		}
	} catch (error) {
		console.error("[UPDATE_PROFILE]", error)
		return {
			ok: false,
			message: "Error al actualizar el perfil",
		}
	}
}
