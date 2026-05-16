import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

type Result<T> =
	| { ok: true; data: T }
	| { ok: false; message: string }

interface UserRow {
	id: string
	name: string
	email: string
	rut: string
	role: string
	accessRole: string
	companyId: string | null
	isSupervisor: boolean | null
	isActive: boolean
	createdAt: string
	updatedAt: string
}

async function listAllUsers(limit: number, page: number): Promise<UserRow[]> {
	const db = await getDemoDb()
	const skip = (page - 1) * limit
	const { rows } = await db.query<UserRow>(
		`SELECT id, name, email, rut, role, "accessRole", "companyId",
			"isSupervisor", "isActive", "createdAt", "updatedAt"
		 FROM "user"
		 ORDER BY "createdAt" DESC
		 LIMIT $1 OFFSET $2`,
		[limit, skip]
	)
	return rows
}

export const getUsers = async (limit: number, page: number): Promise<Result<UserRow[]>> => {
	if (!getDemoUser()) return { ok: false, message: "No autorizado" }
	try {
		return { ok: true, data: await listAllUsers(limit, page) }
	} catch (error) {
		console.error("[GET_USERS]", error)
		return { ok: false, message: "Error al cargar los usuarios" }
	}
}

export const getUsersByCompanyId = async (companyId: string): Promise<Result<UserRow[]>> => {
	if (!getDemoUser()) return { ok: false, message: "No autorizado" }
	try {
		const db = await getDemoDb()
		const { rows } = await db.query<UserRow>(
			`SELECT id, name, email, rut, role, "accessRole", "companyId",
				"isSupervisor", "isActive", "createdAt", "updatedAt"
			 FROM "user"
			 WHERE "companyId" = $1`,
			[companyId]
		)
		return { ok: true, data: rows }
	} catch (error) {
		console.error("[GET_USERS_BY_COMPANY]", error)
		return { ok: false, message: "Error al cargar los usuarios" }
	}
}

export const getUserById = async (userId: string): Promise<Result<UserRow>> => {
	if (!getDemoUser()) return { ok: false, message: "No autorizado" }
	try {
		const db = await getDemoDb()
		const { rows } = await db.query<UserRow>(
			`SELECT id, name, email, rut, role, "accessRole", "companyId",
				"isSupervisor", "isActive", "createdAt", "updatedAt"
			 FROM "user" WHERE id = $1`,
			[userId]
		)
		const user = rows[0]
		if (!user) return { ok: false, message: "Usuario no encontrado" }
		return { ok: true, data: user }
	} catch (error) {
		console.error("[GET_USER_BY_ID]", error)
		return { ok: false, message: "Error al cargar el usuario" }
	}
}

export const getInternalUsers = async (
	limit: number,
	page: number
): Promise<Result<UserRow[]>> => {
	if (!getDemoUser()) return { ok: false, message: "No autorizado" }
	try {
		const db = await getDemoDb()
		const skip = (page - 1) * limit
		const { rows } = await db.query<UserRow>(
			`SELECT id, name, email, rut, role, "accessRole", "companyId",
				"isSupervisor", "isActive", "createdAt", "updatedAt"
			 FROM "user"
			 WHERE "accessRole" = 'ADMIN'
			 ORDER BY "createdAt" DESC
			 LIMIT $1 OFFSET $2`,
			[limit, skip]
		)
		return { ok: true, data: rows }
	} catch (error) {
		console.error("[GET_INTERNAL_USERS]", error)
		return { ok: false, message: "Error al cargar los usuarios" }
	}
}

export const getUsersByWorkOrderId = async (
	workOrderId: string
): Promise<Result<UserRow[]>> => {
	if (!getDemoUser()) return { ok: false, message: "No autorizado" }
	try {
		const db = await getDemoDb()
		const companyResult = await db.query<{ companyId: string | null }>(
			`SELECT "companyId" FROM "work_order" WHERE id = $1`,
			[workOrderId]
		)
		const companyId = companyResult.rows[0]?.companyId
		if (!companyId) return { ok: false, message: "No se encontró la empresa" }

		const { rows } = await db.query<UserRow>(
			`SELECT id, name, email, rut, role, "accessRole", "companyId",
				"isSupervisor", "isActive", "createdAt", "updatedAt"
			 FROM "user"
			 WHERE "companyId" = $1 AND "isActive" = true`,
			[companyId]
		)
		return { ok: true, data: rows }
	} catch (error) {
		console.error("[GET_USERS_BY_WORK_ORDER]", error)
		return { ok: false, message: "Error al cargar los usuarios" }
	}
}
