"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
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
		const { participants, ...rest } = values

		const workPermit = await prisma.workPermit.create({
			data: {
				...rest,
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
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.WORK_PERMITS,
			action: ACTIVITY_TYPE.CREATE,
			entityId: workPermit.id,
			entityType: "WorkPermit",
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
