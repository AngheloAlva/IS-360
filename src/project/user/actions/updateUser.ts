"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { ExternalUserSchema } from "@/project/user/schemas/externalUser.schema"
import type { InternalUserSchema } from "@/project/user/schemas/internalUser.schema"
import type { PrismaClientKnownRequestError } from "@prisma/client/runtime/client"
import type { ProfileFormSchema } from "@/project/auth/schemas/profile.schema"

interface UpdateExternalUserProps {
	userId: string
	values: ExternalUserSchema
}

const PASSWORD_RESET_REDIRECT_TO = "/auth/restablecer-contrasena"

export const updateExternalUser = async ({ userId, values }: UpdateExternalUserProps) => {
	const requestHeaders = await headers()
	const session = await auth.api.getSession({
		headers: requestHeaders,
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const currentUser = await prisma.user.findUnique({
			where: {
				id: userId,
			},
			select: {
				email: true,
			},
		})

		if (!currentUser) {
			return {
				ok: false,
				message: "No se encontró el usuario a actualizar",
			}
		}

		const nextEmail = values.email.trim().toLowerCase()
		const emailWasChanged = currentUser.email.toLowerCase() !== nextEmail

		const user = await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				...values,
				email: nextEmail,
			},
			select: {
				id: true,
				email: true,
				name: true,
				companyId: true,
				isSupervisor: true,
			},
		})

		let passwordResetEmailSent = false
		if (emailWasChanged) {
			const resetPasswordResult = await auth.api.requestPasswordReset({
				body: {
					email: user.email,
					redirectTo: PASSWORD_RESET_REDIRECT_TO,
				},
				headers: requestHeaders,
			})

			passwordResetEmailSent = resetPasswordResult.status

			if (!resetPasswordResult.status) {
				console.error("[UPDATE_EXTERNAL_USER][REQUEST_PASSWORD_RESET]", resetPasswordResult.message)
			}
		}

  await logActivity({
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
			passwordResetEmailSent,
			emailWasChanged,
		}
	} catch (error) {
		if ((error as PrismaClientKnownRequestError).code === "P2002") {
			return {
				ok: false,
				message: "El correo o RUT ingresado ya está registrado",
			}
		}

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
	const requestHeaders = await headers()
	const session = await auth.api.getSession({
		headers: requestHeaders,
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const currentUser = await prisma.user.findUnique({
			where: {
				id: userId,
			},
			select: {
				email: true,
			},
		})

		if (!currentUser) {
			return {
				ok: false,
				message: "No se encontró el usuario a actualizar",
			}
		}

		const { role, allowedModules, allowedCompanies, ...rest } = values
		const nextEmail = rest.email.trim().toLowerCase()
		const emailWasChanged = currentUser.email.toLowerCase() !== nextEmail

		const user = await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				...rest,
				email: nextEmail,
				role: role.join(","),
				allowedModules: allowedModules,
				allowedCompanies: allowedCompanies || [],
			},
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				allowedModules: true,
				allowedCompanies: true,
			},
		})

		let passwordResetEmailSent = false
		if (emailWasChanged) {
			const resetPasswordResult = await auth.api.requestPasswordReset({
				body: {
					email: user.email,
					redirectTo: PASSWORD_RESET_REDIRECT_TO,
				},
				headers: requestHeaders,
			})

			passwordResetEmailSent = resetPasswordResult.status

			if (!resetPasswordResult.status) {
				console.error("[UPDATE_INTERNAL_USER][REQUEST_PASSWORD_RESET]", resetPasswordResult.message)
			}
		}

  await logActivity({
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
				allowedCompanies: user.allowedCompanies,
				updatedFields: [...Object.keys(rest), "role", "allowedModules"],
			},
		})

		return {
			ok: true,
			data: user,
			passwordResetEmailSent,
			emailWasChanged,
		}
	} catch (error) {
		if ((error as PrismaClientKnownRequestError).code === "P2002") {
			return {
				ok: false,
				message: "El correo o RUT ingresado ya está registrado",
			}
		}

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

  await logActivity({
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
