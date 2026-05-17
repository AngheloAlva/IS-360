import { ACTIVITY_SEVERITY, ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { createDiff } from "@/lib/activity/diff"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface UserSummary {
	id: string
	email: string
	name: string
	companyId: string | null
}

async function deactivateUser(userId: string, extraWhere?: { companyId?: string }) {
	const db = await getDemoDb()
	const now = new Date().toISOString()
	const conditions = ["id = $1"]
	const params: unknown[] = [userId]
	if (extraWhere?.companyId) {
		params.push(extraWhere.companyId)
		conditions.push(`"companyId" = $${params.length}`)
	}
	params.push(now)
	const result = await db.query<UserSummary>(
		`UPDATE "user"
		 SET "isActive" = false, "updatedAt" = $${params.length}
		 WHERE ${conditions.join(" AND ")}
		 RETURNING id, email, name, "companyId"`,
		params,
	)
	return result.rows[0] ?? null
}

export const deleteUser = async (userId: string) => {
	const sessionUser = getDemoUser()
	if (!sessionUser) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const user = await deactivateUser(userId)
		if (!user) {
			return { ok: false, message: "Usuario no encontrado" }
		}

		const diff = createDiff({ isActive: true }, { isActive: false })

		await logActivity({
			userId: sessionUser.id,
			module: MODULES.USERS,
			action: ACTIVITY_TYPE.DELETE,
			entityId: user.id,
			entityType: "User",
			severity: ACTIVITY_SEVERITY.HIGH,
			...diff,
			metadata: { email: user.email, name: user.name, companyId: user.companyId },
		})

		return { ok: true, message: "Usuario eliminado correctamente" }
	} catch (error) {
		console.error("[DELETE_USER]", error)
		return { ok: false, message: "Error al eliminar el usuario" }
	}
}

export const deleteExternalUser = async (workerId: string, companyId: string) => {
	const sessionUser = getDemoUser()
	if (!sessionUser) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const worker = await deactivateUser(workerId, { companyId })
		if (!worker) {
			return {
				ok: false,
				message: "Colaborador no encontrado o no tienes permisos para eliminarlo",
			}
		}

		const diff = createDiff({ isActive: true }, { isActive: false })

		await logActivity({
			userId: sessionUser.id,
			module: MODULES.USERS,
			action: ACTIVITY_TYPE.DELETE,
			entityId: worker.id,
			entityType: "User",
			severity: ACTIVITY_SEVERITY.HIGH,
			...diff,
			metadata: { email: worker.email, name: worker.name, companyId: worker.companyId },
		})

		return { ok: true, message: "Colaborador eliminado correctamente" }
	} catch (error) {
		console.error("[DELETE_EXTERNAL_USER]", error)
		return { ok: false, message: "Error al eliminar el colaborador" }
	}
}
