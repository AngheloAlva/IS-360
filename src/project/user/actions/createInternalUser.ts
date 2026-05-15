"use server"

import { headers } from "next/headers"

import { generateTemporalPassword } from "@/lib/generateTemporalPassword"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { sendNewUserEmail } from "@/project/user/actions/sendNewUserEmail"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"

import type { InternalUserSchema } from "@/project/user/schemas/internalUser.schema"

interface CreateInternalUserResult {
	ok: boolean
	message?: string
	errorCode?: "USER_ALREADY_EXISTS" | "FORBIDDEN" | "UNKNOWN"
	data?: { id: string; email: string; name: string }
}

export async function createInternalUser({
	values,
}: {
	values: InternalUserSchema
}): Promise<CreateInternalUserResult> {
	const requestHeaders = await headers()
	const session = await auth.api.getSession({ headers: requestHeaders })

	if (!session?.user?.id) {
		return { ok: false, message: "No autorizado", errorCode: "FORBIDDEN" }
	}

	const temporalPassword = generateTemporalPassword()

	try {
		const created = await auth.api.createUser({
			headers: requestHeaders,
			body: {
				name: values.name,
				email: values.email,
				password: temporalPassword,
				role: values.role as ["user"],
				data: {
					rut: values.rut,
					area: values.area,
					phone: values.phone,
					accessRole: "ADMIN",
					internalRole: values.internalRole,
					documentAreas: values.documentAreas ?? [],
					allowedModules: values.allowedModules,
					allowedCompanies: values.allowedCompanies ?? [],
				},
			},
		})

		const newUserId = created.user.id

		if (values.role.length > 1) {
			await auth.api.setRole({
				headers: requestHeaders,
				body: {
					userId: newUserId,
					role: values.role as ["user"],
				},
			})
		}

		await logActivity({
			userId: session.user.id,
			module: MODULES.USERS,
			action: ACTIVITY_TYPE.ASSIGN,
			entityId: newUserId,
			entityType: "User",
			metadata: {
				type: "internal-user-create",
				email: values.email,
				name: values.name,
				role: values.role,
				accessRole: "ADMIN",
				allowedModules: values.allowedModules,
				allowedCompanies: values.allowedCompanies ?? [],
				area: values.area,
				documentAreas: values.documentAreas ?? [],
			},
		})

		void sendNewUserEmail({
			name: values.name,
			email: values.email,
			password: temporalPassword,
		})

		return {
			ok: true,
			data: { id: newUserId, email: values.email, name: values.name },
		}
	} catch (error) {
		console.error("[CREATE_INTERNAL_USER]", error)

		const code = (error as { body?: { code?: string }; status?: string })?.body?.code
		const status = (error as { status?: string })?.status

		if (code === "USER_ALREADY_EXISTS") {
			return {
				ok: false,
				message: "El usuario ya existe. Verifique el RUT y email.",
				errorCode: "USER_ALREADY_EXISTS",
			}
		}

		if (code === "ONLY_ADMINS_CAN_ACCESS_THIS_ENDPOINT" || status === "UNAUTHORIZED") {
			return {
				ok: false,
				message: "No tienes permiso para crear usuarios",
				errorCode: "FORBIDDEN",
			}
		}

		return {
			ok: false,
			message: "Error al crear el usuario",
			errorCode: "UNKNOWN",
		}
	}
}
