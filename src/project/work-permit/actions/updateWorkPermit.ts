import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"
import { getScopedWorkPermitId } from "@/project/work-permit/utils/authorization"

import type { WorkPermitSchema } from "../schemas/work-permit.schema"

interface UpdateWorkPermitProps {
	id: string
	values: WorkPermitSchema
}

export const updateWorkPermit = async ({ id, values }: UpdateWorkPermitProps) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No se pudo obtener la sesión del usuario" }
	}

	try {
		const db = await getDemoDb()

		const scopedId = await getScopedWorkPermitId({ workPermitId: id, userId: user.id })
		if (!scopedId) {
			return { ok: false, message: "Permiso de trabajo no encontrado" }
		}

		const { participants, activityDetails, ...rest } = values

		const activityTexts = activityDetails.map((a) => a.activity)
		const legacyRisks = [...new Set(activityDetails.flatMap((a) => a.riesgos))]
		const legacyMeasures = [
			...new Set(activityDetails.flatMap((a) => a.medidasDeControl)),
		]

		const now = new Date().toISOString()

		await db.query(
			`UPDATE "work_permit" SET
				"isUrgent" = $1, "aplicantPt" = $2, mutuality = $3, "otherMutuality" = $4,
				"exactPlace" = $5, "workWillBe" = $6, "workWillBeOther" = $7, tools = $8, "otherTools" = $9,
				"preChecks" = $10, "otherPreChecks" = $11, "activityDetails" = $12, "riskIdentification" = $13,
				"otherRisk" = '', "preventiveControlMeasures" = $14, "otherPreventiveControlMeasures" = '',
				"generateWaste" = $15, "wasteType" = $16, "wasteDisposalLocation" = $17, "otherWasteDisposalLocation" = $18,
				"additionalObservations" = $19, "acceptTerms" = $20,
				"startDate" = $21, "endDate" = $22,
				"updatedAt" = $23
			 WHERE id = $24`,
			[
				rest.isUrgent ?? false,
				rest.aplicantPt,
				rest.mutuality,
				rest.otherMutuality ?? null,
				rest.exactPlace,
				rest.workWillBe,
				rest.workWillBeOther ?? null,
				rest.tools ?? [],
				rest.otherTools ?? null,
				rest.preChecks ?? [],
				rest.otherPreChecks ?? null,
				activityTexts,
				legacyRisks,
				legacyMeasures,
				rest.generateWaste ?? false,
				rest.wasteType ?? null,
				rest.wasteDisposalLocation ?? null,
				rest.otherWasteDisposalLocation ?? null,
				rest.additionalObservations ?? null,
				rest.acceptTerms ?? false,
				new Date(rest.startDate).toISOString(),
				new Date(rest.endDate).toISOString(),
				now,
				scopedId,
			],
		)

		await db.query(`DELETE FROM "WorkPermitActivity" WHERE "workPermitId" = $1`, [scopedId])
		for (let i = 0; i < activityDetails.length; i++) {
			const a = activityDetails[i]
			await db.query(
				`INSERT INTO "WorkPermitActivity" (
					id, activity, peligros, riesgos, "medidasDeControl",
					"otroPeligro", "otroRiesgo", "otraMedidaDeControl",
					"order", "workPermitId"
				) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
				[
					crypto.randomUUID(),
					a.activity,
					a.peligros,
					a.riesgos,
					a.medidasDeControl,
					a.otroPeligro || null,
					a.otroRiesgo || null,
					a.otraMedidaDeControl || null,
					i,
					scopedId,
				],
			)
		}

		await db.query(`DELETE FROM "_WorkPermitParticipants" WHERE "B" = $1`, [scopedId])
		for (const p of participants) {
			await db.query(
				`INSERT INTO "_WorkPermitParticipants" ("A", "B") VALUES ($1, $2)
				 ON CONFLICT DO NOTHING`,
				[p.userId, scopedId],
			)
		}

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_PERMITS,
				action: ACTIVITY_TYPE.UPDATE,
				entityId: scopedId,
				entityType: "WorkPermit",
			})
		} catch {
			// audit best-effort
		}

		return { ok: true, message: "Permiso de trabajo actualizado exitosamente" }
	} catch (error) {
		console.error("[UPDATE_WORK_PERMIT]", error)
		return { ok: false, message: "Error al actualizar el permiso de trabajo" }
	}
}
