import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { ExternalUserSchema } from "@/project/user/schemas/externalUser.schema"
import type { InternalUserSchema } from "@/project/user/schemas/internalUser.schema"
import type { ProfileFormSchema } from "@/project/auth/schemas/profile.schema"

interface UserRow {
	id: string
	email: string
	name: string
	phone: string | null
	image: string | null
	role: string | null
	companyId: string | null
	isSupervisor: boolean
	allowedModules: string[]
	allowedCompanies: string[]
}

async function isDuplicateUniqueKeyError(error: unknown): Promise<boolean> {
	if (!(error instanceof Error)) return false
	const message = error.message.toLowerCase()
	return message.includes("unique") || message.includes("duplicate")
}

interface UpdateExternalUserProps {
	userId: string
	values: ExternalUserSchema
}

export const updateExternalUser = async ({ userId, values }: UpdateExternalUserProps) => {
	const sessionUser = getDemoUser()
	if (!sessionUser) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const currentRes = await db.query<{ email: string }>(
			`SELECT email FROM "user" WHERE id = $1`,
			[userId],
		)
		const current = currentRes.rows[0]
		if (!current) {
			return { ok: false, message: "No se encontró el usuario a actualizar" }
		}

		const nextEmail = values.email.trim().toLowerCase()
		const emailWasChanged = current.email.toLowerCase() !== nextEmail
		const now = new Date().toISOString()

		const keys = Object.keys(values) as (keyof ExternalUserSchema)[]
		const setClauses: string[] = []
		const params: unknown[] = []
		for (const key of keys) {
			params.push(key === "email" ? nextEmail : values[key])
			setClauses.push(`"${key}" = $${params.length}`)
		}
		params.push(now)
		setClauses.push(`"updatedAt" = $${params.length}`)
		params.push(userId)

		const updateRes = await db.query<UserRow>(
			`UPDATE "user"
			 SET ${setClauses.join(", ")}
			 WHERE id = $${params.length}
			 RETURNING id, email, name, "companyId", "isSupervisor"`,
			params,
		)
		const user = updateRes.rows[0]

		await logActivity({
			userId: sessionUser.id,
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
			passwordResetEmailSent: false,
			emailWasChanged,
		}
	} catch (error) {
		if (await isDuplicateUniqueKeyError(error)) {
			return { ok: false, message: "El correo o RUT ingresado ya está registrado" }
		}
		console.error("[UPDATE_EXTERNAL_USER]", error)
		return { ok: false, message: "Error al actualizar el usuario" }
	}
}

interface UpdateInternalUserProps {
	userId: string
	values: InternalUserSchema
}

export const updateInternalUser = async ({ userId, values }: UpdateInternalUserProps) => {
	const sessionUser = getDemoUser()
	if (!sessionUser) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const currentRes = await db.query<{ email: string }>(
			`SELECT email FROM "user" WHERE id = $1`,
			[userId],
		)
		const current = currentRes.rows[0]
		if (!current) {
			return { ok: false, message: "No se encontró el usuario a actualizar" }
		}

		const { role, allowedModules, allowedCompanies, ...rest } = values
		const nextEmail = rest.email.trim().toLowerCase()
		const emailWasChanged = current.email.toLowerCase() !== nextEmail
		const now = new Date().toISOString()

		const restKeys = Object.keys(rest) as (keyof typeof rest)[]
		const setClauses: string[] = []
		const params: unknown[] = []
		for (const key of restKeys) {
			params.push(key === "email" ? nextEmail : rest[key])
			setClauses.push(`"${key}" = $${params.length}`)
		}
		params.push(role.join(","))
		setClauses.push(`"role" = $${params.length}`)
		params.push(allowedModules)
		setClauses.push(`"allowedModules" = $${params.length}`)
		params.push(allowedCompanies || [])
		setClauses.push(`"allowedCompanies" = $${params.length}`)
		params.push(now)
		setClauses.push(`"updatedAt" = $${params.length}`)
		params.push(userId)

		const updateRes = await db.query<UserRow>(
			`UPDATE "user"
			 SET ${setClauses.join(", ")}
			 WHERE id = $${params.length}
			 RETURNING id, email, name, role, "allowedModules", "allowedCompanies"`,
			params,
		)
		const user = updateRes.rows[0]

		await logActivity({
			userId: sessionUser.id,
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
			passwordResetEmailSent: false,
			emailWasChanged,
		}
	} catch (error) {
		if (await isDuplicateUniqueKeyError(error)) {
			return { ok: false, message: "El correo o RUT ingresado ya está registrado" }
		}
		console.error("[UPDATE_INTERNAL_USER]", error)
		return { ok: false, message: "Error al actualizar el usuario" }
	}
}

interface UpdateProfileProps {
	userId: string
	imageUrl?: string
	values: ProfileFormSchema
}

export const updateProfile = async ({ userId, imageUrl, values }: UpdateProfileProps) => {
	const sessionUser = getDemoUser()
	if (!sessionUser) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const now = new Date().toISOString()

		const setClauses: string[] = [`"name" = $1`, `"phone" = $2`, `"updatedAt" = $3`]
		const params: unknown[] = [values.name, values.phone, now]
		if (imageUrl) {
			params.push(imageUrl)
			setClauses.push(`"image" = $${params.length}`)
		}
		params.push(userId)

		const updateRes = await db.query<UserRow>(
			`UPDATE "user"
			 SET ${setClauses.join(", ")}
			 WHERE id = $${params.length}
			 RETURNING id, email, name, phone, image`,
			params,
		)
		const user = updateRes.rows[0]

		await logActivity({
			userId: sessionUser.id,
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

		return { ok: true, data: user }
	} catch (error) {
		console.error("[UPDATE_PROFILE]", error)
		return { ok: false, message: "Error al actualizar el perfil" }
	}
}
