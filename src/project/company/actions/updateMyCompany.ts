import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface UpdateCompanyProps {
	companyId: string
	imageUrl?: string
}

export const updateCompany = async ({ companyId, imageUrl }: UpdateCompanyProps) => {
	const sessionUser = getDemoUser()
	if (!sessionUser) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		if (!imageUrl) {
			return { ok: true, data: null }
		}

		const db = await getDemoDb()
		const now = new Date().toISOString()
		const updateRes = await db.query<{
			id: string
			name: string
			rut: string
		}>(
			`UPDATE "company"
			 SET image = $1, "updatedAt" = $2
			 WHERE id = $3
			 RETURNING id, name, rut`,
			[imageUrl, now, companyId],
		)
		const company = updateRes.rows[0]
		if (!company) {
			return { ok: false, message: "Empresa no encontrada" }
		}

		await logActivity({
			userId: sessionUser.id,
			module: MODULES.COMPANY,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: company.id,
			entityType: "Company",
			metadata: {
				name: company.name,
				rut: company.rut,
				updatedImage: !!imageUrl,
			},
		})

		return { ok: true, data: company }
	} catch (error) {
		console.error("[UPDATE_COMPANY]", error)
		return { ok: false, message: "Error al actualizar la empresa" }
	}
}
