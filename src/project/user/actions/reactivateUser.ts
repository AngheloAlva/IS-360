import { ACTIVITY_SEVERITY, ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { createDiff } from "@/lib/activity/diff"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

export const reactivateUser = async (userId: string) => {
	const sessionUser = getDemoUser()
	if (!sessionUser) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const now = new Date().toISOString()
		const updateRes = await db.query<{
			id: string
			email: string
			name: string
			companyId: string | null
		}>(
			`UPDATE "user"
			 SET "isActive" = true, "updatedAt" = $1
			 WHERE id = $2
			 RETURNING id, email, name, "companyId"`,
			[now, userId],
		)
		const user = updateRes.rows[0]
		if (!user) {
			return { ok: false, message: "Usuario no encontrado" }
		}

		const diff = createDiff({ isActive: false }, { isActive: true })

		await logActivity({
			module: MODULES.USERS,
			userId: sessionUser.id,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: user.id,
			entityType: "User",
			severity: ACTIVITY_SEVERITY.HIGH,
			...diff,
			metadata: { name: user.name, email: user.email, companyId: user.companyId },
		})

		return { ok: true, message: "Usuario reactivado correctamente" }
	} catch (error) {
		console.error("[REACTIVATE_USER]", error)
		return { ok: false, message: "Error al reactivar el usuario" }
	}
}
