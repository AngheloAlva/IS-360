"use server"

import { headers } from "next/headers"

import { sendUrgentWorkPermitEmail } from "./sendUrgentWorkPermitEmail"
import { ACCESS_ROLE, ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { WorkPermitSchema } from "@/project/work-permit/schemas/work-permit.schema"

interface CreateWorkPermitProps {
	companyId: string
	values: WorkPermitSchema
}

export const createWorkPermit = async ({ values, companyId }: CreateWorkPermitProps) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		return {
			ok: false,
			message: "No se pudo obtener la sesión del usuario",
		}
	}

	try {
		const resolvedCompanyId =
			session.user.accessRole === ACCESS_ROLE.ADMIN
				? companyId
				: (session.user.companyId ?? companyId)

		const { participants, activityDetails, otNumber, ...rest } = values

		const activityTexts = activityDetails.map((a) => a.activity)
		const legacyRisks = [...new Set(activityDetails.flatMap((a) => a.riesgos))]
		const legacyMeasures = [...new Set(activityDetails.flatMap((a) => a.medidasDeControl))]

		const workPermit = await prisma.workPermit.create({
			data: {
				...rest,
				activityDetails: activityTexts,
				riskIdentification: legacyRisks,
				preventiveControlMeasures: legacyMeasures,
				otherRisk: "",
				otherPreventiveControlMeasures: "",
				activities: {
					create: activityDetails.map((a, idx) => ({
						activity: a.activity,
						peligros: a.peligros,
						riesgos: a.riesgos,
						medidasDeControl: a.medidasDeControl,
						otroPeligro: a.otroPeligro || null,
						otroRiesgo: a.otroRiesgo || null,
						otraMedidaDeControl: a.otraMedidaDeControl || null,
						order: idx,
					})),
				},
				...(otNumber
					? {
							otNumber: {
								connect: {
									otNumber: otNumber,
								},
							},
						}
					: {}),
				user: {
					connect: {
						id: session.user.id,
					},
				},
				company: {
					connect: {
						id: resolvedCompanyId,
					},
				},
				participants: {
					connect: participants.map((participant) => ({
						id: participant.userId,
					})),
				},
			},
			include: {
				otNumber: {
					select: {
						otNumber: true,
					},
				},
				company: {
					select: {
						name: true,
					},
				},
				user: {
					select: {
						name: true,
					},
				},
				participants: {
					select: {
						name: true,
					},
				},
			},
		})

		if (values.isUrgent) {
			try {
				await sendUrgentWorkPermitEmail({
					applicantName: workPermit.user.name,
					companyName: workPermit.company.name,
					exactPlace: values.exactPlace,
					workWillBe: values.workWillBe,
					activityDetails: values.activityDetails.map((detail) => detail.activity),
					startDate: values.startDate,
					endDate: values.endDate,
					participants: workPermit.participants.map((p) => p.name),
					otNumber: workPermit.otNumber?.otNumber,
					additionalObservations: values.additionalObservations,
				})
				console.log("[CREATE_WORK_PERMIT] Urgent email sent successfully")
			} catch (emailError) {
				console.error("[CREATE_WORK_PERMIT] Failed to send urgent email:", emailError)
				// No fallar la creación del permiso si el email falla
			}
		}

		const folderLink = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard/permisos-de-trabajo`

  await logActivity({
			userId: session.user.id,
			entityId: workPermit.id,
			entityType: "WorkPermit",
			module: MODULES.WORK_PERMITS,
			action: ACTIVITY_TYPE.CREATE,
		})

		return {
			ok: true,
			message: "Permiso de trabajo creado exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al crear el permiso de trabajo",
		}
	}
}
