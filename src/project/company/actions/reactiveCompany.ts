import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

export const reactiveCompany = async (companyId: string) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const companyRes = await db.query<{ id: string; name: string; rut: string }>(
			`SELECT id, name, rut FROM "company" WHERE id = $1`,
			[companyId],
		)
		const company = companyRes.rows[0]
		if (!company) {
			return { ok: false, message: "Empresa no encontrada" }
		}

		const now = new Date().toISOString()
		const usersRes = await db.query<{ count: string }>(
			`SELECT COUNT(*)::text AS count FROM "user" WHERE "companyId" = $1`,
			[companyId],
		)
		const vehiclesRes = await db.query<{ count: string }>(
			`SELECT COUNT(*)::text AS count FROM "vehicle" WHERE "companyId" = $1`,
			[companyId],
		)

		await db.query(
			`UPDATE "user" SET "isActive" = true, "updatedAt" = $1 WHERE "companyId" = $2`,
			[now, companyId],
		)
		await db.query(
			`UPDATE "vehicle" SET "isActive" = true, "updatedAt" = $1 WHERE "companyId" = $2`,
			[now, companyId],
		)
		await db.query(
			`UPDATE "company" SET "isActive" = true, "updatedAt" = $1 WHERE id = $2`,
			[now, companyId],
		)

		await logActivity({
			userId: user.id,
			module: MODULES.COMPANY,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: company.id,
			entityType: "Company",
			metadata: {
				name: company.name,
				rut: company.rut,
				affectedUsers: parseInt(usersRes.rows[0]?.count ?? "0", 10),
				affectedVehicles: parseInt(vehiclesRes.rows[0]?.count ?? "0", 10),
			},
		})

		return { ok: true, message: "Empresa reactivada correctamente" }
	} catch (error) {
		console.error("[REACTIVE_COMPANY]", error)
		return { ok: false, message: "Error al reactivar la empresa" }
	}
}
