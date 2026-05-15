"use server"
import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getScopedWorkPermitId } from "@/project/work-permit/utils/authorization"

import type { WorkPermitSchema } from "../schemas/work-permit.schema"

interface UpdateWorkPermitProps {
	id: string
	values: WorkPermitSchema
}

export const updateWorkPermit = async ({ id, values }: UpdateWorkPermitProps) => {
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
		const currentPermit = await prisma.workPermit.findUnique({
			where: { id },
			select: {
				id: true,
				userId: true,
				companyId: true,
			},
		})

		if (!currentPermit) {
			return {
				ok: false,
				message: "Permiso de trabajo no encontrado",
			}
		}

		const scopedWorkPermitId = await getScopedWorkPermitId({
			workPermitId: id,
			userId: session.user.id,
		})
		const hasCompanyAccess = Boolean(scopedWorkPermitId)

		if (!hasCompanyAccess && currentPermit.userId !== session.user.id) {
			return {
				ok: false,
				message: "No tienes permisos para actualizar este permiso de trabajo",
			}
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { participants, activityDetails, otNumber, ...rest } = values

		const activityTexts = activityDetails.map((a) => a.activity)
		const legacyRisks = [...new Set(activityDetails.flatMap((a) => a.riesgos))]
		const legacyMeasures = [...new Set(activityDetails.flatMap((a) => a.medidasDeControl))]

		const [, updatedWorkPermit] = await prisma.$transaction([
			prisma.workPermitActivity.deleteMany({ where: { workPermitId: id } }),
			prisma.workPermit.update({
				where: { id },
				data: {
					...rest,
					activityDetails: activityTexts,
					riskIdentification: legacyRisks,
					preventiveControlMeasures: legacyMeasures,
					otherRisk: "",
					otherPreventiveControlMeasures: "",
					participants: {
						set: participants.map((participant) => ({
							id: participant.userId,
						})),
					},
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
				},
			}),
		])

		if (!updatedWorkPermit) {
			return {
				ok: false,
				message: "Permiso de trabajo no encontrado",
			}
		}

  await logActivity({
			userId: session.user.id,
			module: MODULES.WORK_PERMITS,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: updatedWorkPermit.id,
			entityType: "WorkPermit",
		})

		return {
			ok: true,
			message: "Permiso de trabajo actualizado exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al actualizar el permiso de trabajo",
		}
	}
}
