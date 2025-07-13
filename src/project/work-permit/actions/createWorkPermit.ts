"use server"

import { headers } from "next/headers"

import { sendNotification } from "@/shared/actions/notifications/send-notification"
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
		const { participants, activityDetails, ...rest } = values

		const workPermit = await prisma.workPermit.create({
			data: {
				...rest,
				activityDetails: activityDetails.map((activityDetail) => activityDetail.activity),
				otNumber: {
					connect: {
						otNumber: values.otNumber,
					},
				},
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
			select: {
				id: true,
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
			},
		})

		const folderLink = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard/permisos-de-trabajo`

		sendNotification({
			link: folderLink,
			creatorId: userId,
			type: "WORK_PERMIT_SUBMITTED",
			title: `Nuevo permiso de trabajo`,
			targetRoles: [USER_ROLE.admin, USER_ROLE.operator],
			message: `La empresa ${workPermit.company.name} ha creado un nuevo permiso de trabajo para la ${workPermit.otNumber.otNumber}`,
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
