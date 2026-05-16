import { sendUrgentWorkPermitEmail } from "./sendUrgentWorkPermitEmail"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { WorkPermitSchema } from "@/project/work-permit/schemas/work-permit.schema"

interface CreateWorkPermitProps {
	companyId: string
	values: WorkPermitSchema
}

export const createWorkPermit = async ({ values, companyId }: CreateWorkPermitProps) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No se pudo obtener la sesión del usuario" }
	}

	try {
		const db = await getDemoDb()
		const { participants, activityDetails, otNumber, ...rest } = values

		const resolvedCompanyId = user.companyId ?? companyId

		const activityTexts = activityDetails.map((a) => a.activity)
		const legacyRisks = [...new Set(activityDetails.flatMap((a) => a.riesgos))]
		const legacyMeasures = [
			...new Set(activityDetails.flatMap((a) => a.medidasDeControl)),
		]

		let otNumberId: string | null = null
		if (otNumber) {
			const otResult = await db.query<{ id: string }>(
				`SELECT id FROM "work_order" WHERE "otNumber" = $1 LIMIT 1`,
				[otNumber],
			)
			otNumberId = otResult.rows[0]?.id ?? null
		}

		const id = crypto.randomUUID()
		const now = new Date().toISOString()

		await db.query(
			`INSERT INTO "work_permit" (
				id, "isUrgent", "aplicantPt", mutuality, "otherMutuality",
				"exactPlace", "workWillBe", "workWillBeOther", tools, "otherTools",
				"preChecks", "otherPreChecks", "activityDetails", "riskIdentification",
				"otherRisk", "preventiveControlMeasures", "otherPreventiveControlMeasures",
				"generateWaste", "wasteType", "wasteDisposalLocation", "otherWasteDisposalLocation",
				"additionalObservations", "acceptTerms",
				"startDate", "endDate", "createdAt", "updatedAt",
				"otNumberId", "userId", "companyId"
			) VALUES (
				$1, $2, $3, $4, $5,
				$6, $7, $8, $9, $10,
				$11, $12, $13, $14,
				'', $15, '',
				$16, $17, $18, $19,
				$20, $21,
				$22, $23, $24, $24,
				$25, $26, $27
			)`,
			[
				id,
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
				otNumberId,
				user.id,
				resolvedCompanyId,
			],
		)

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
					id,
				],
			)
		}

		for (const p of participants) {
			await db.query(
				`INSERT INTO "_WorkPermitParticipants" ("A", "B") VALUES ($1, $2)
				 ON CONFLICT DO NOTHING`,
				[p.userId, id],
			)
		}

		if (values.isUrgent) {
			try {
				await sendUrgentWorkPermitEmail({
					applicantName: user.name,
					companyName: "",
					exactPlace: values.exactPlace,
					workWillBe: values.workWillBe,
					activityDetails: activityTexts,
					startDate: values.startDate,
					endDate: values.endDate,
					participants: participants.map((p) => p.userId),
					otNumber: otNumber || undefined,
					additionalObservations: values.additionalObservations,
				})
			} catch (e) {
				console.error("[CREATE_WORK_PERMIT] urgent email failed:", e)
			}
		}

		try {
			await logActivity({
				userId: user.id,
				entityId: id,
				entityType: "WorkPermit",
				module: MODULES.WORK_PERMITS,
				action: ACTIVITY_TYPE.CREATE,
			})
		} catch {
			// audit best-effort
		}

		return { ok: true, message: "Permiso de trabajo creado exitosamente" }
	} catch (error) {
		console.error("[CREATE_WORK_PERMIT]", error)
		return { ok: false, message: "Error al crear el permiso de trabajo" }
	}
}
