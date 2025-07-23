"use server"

import { headers } from "next/headers"

import { sendNotification } from "@/shared/actions/notifications/send-notification"
import { sendUrgentWorkPermitEmail } from "./sendUrgentWorkPermitEmail"
import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { USER_ROLE } from "@/lib/permissions"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { WorkPermitSchema } from "@/project/work-permit/schemas/work-permit.schema"

interface CreateWorkPermitProps {
	userId: string
	companyId: string
	values: WorkPermitSchema
}

export const createWorkPermit = async ({ values, userId, companyId }: CreateWorkPermitProps) => {
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
		const { participants, activityDetails, otNumber, ...rest } = values

		const workPermit = await prisma.workPermit.create({
			data: {
				...rest,
				activityDetails: activityDetails.map((activityDetail) => activityDetail.activity),
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
						id: userId,
					},
				},
				company: {
					connect: {
						id: companyId,
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

		// Si el permiso es urgente, enviar email a gerencia
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

		sendNotification({
			link: folderLink,
			creatorId: userId,
			targetRoles: [USER_ROLE.admin, USER_ROLE.operator],
			type: values.isUrgent ? "URGENT_WORK_PERMIT_SUBMITTED" : "WORK_PERMIT_SUBMITTED",
			title: `${values.isUrgent ? "🚨 Permiso urgente" : "Nuevo permiso"} de trabajo`,
			message: `La empresa ${workPermit.company.name} ha creado un ${values.isUrgent ? "permiso urgente" : "nuevo permiso"} de trabajo ${workPermit.otNumber ? `para la ${workPermit.otNumber.otNumber}` : ""}`,
		})

		logActivity({
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
