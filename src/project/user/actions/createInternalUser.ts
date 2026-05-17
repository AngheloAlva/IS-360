import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { generateTemporalPassword } from "@/lib/generateTemporalPassword"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"
import { sendNewUserEmail } from "@/project/user/actions/sendNewUserEmail"

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
	const sessionUser = getDemoUser()
	if (!sessionUser) {
		return { ok: false, message: "No autorizado", errorCode: "FORBIDDEN" }
	}

	try {
		const db = await getDemoDb()
		const email = values.email.trim().toLowerCase()

		const existing = await db.query<{ id: string }>(
			`SELECT id FROM "user" WHERE email = $1 OR rut = $2 LIMIT 1`,
			[email, values.rut],
		)
		if (existing.rows.length) {
			return {
				ok: false,
				message: "El usuario ya existe. Verifique el RUT y email.",
				errorCode: "USER_ALREADY_EXISTS",
			}
		}

		const newUserId = crypto.randomUUID()
		const now = new Date().toISOString()
		const temporalPassword = generateTemporalPassword()

		await db.query(
			`INSERT INTO "user" (
				"id", "name", "email", "emailVerified", "rut", "phone", "area",
				"role", "accessRole", "internalRole", "documentAreas",
				"allowedModules", "allowedCompanies", "isActive",
				"createdAt", "updatedAt"
			) VALUES (
				$1, $2, $3, true, $4, $5, $6,
				$7, 'ADMIN', $8, $9,
				$10, $11, true,
				$12, $12
			)`,
			[
				newUserId,
				values.name,
				email,
				values.rut,
				values.phone ?? null,
				values.area ?? null,
				values.role.join(","),
				values.internalRole ?? null,
				values.documentAreas ?? [],
				values.allowedModules,
				values.allowedCompanies ?? [],
				now,
			],
		)

		await logActivity({
			userId: sessionUser.id,
			module: MODULES.USERS,
			action: ACTIVITY_TYPE.ASSIGN,
			entityId: newUserId,
			entityType: "User",
			metadata: {
				type: "internal-user-create",
				email,
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
			email,
			password: temporalPassword,
		})

		return {
			ok: true,
			data: { id: newUserId, email, name: values.name },
		}
	} catch (error) {
		console.error("[CREATE_INTERNAL_USER]", error)
		return { ok: false, message: "Error al crear el usuario", errorCode: "UNKNOWN" }
	}
}
