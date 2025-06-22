"use server"
import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { WorkPermitSchema } from "../schemas/work-permit.schema"

interface UpdateWorkPermitProps {
	id: string
	values: Omit<WorkPermitSchema, "otNumber" | "userId" | "companyId">
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
		const { participants, ...rest } = values

		const updatedWorkPermit = await prisma.workPermit.update({
			where: {
				id,
			},
			data: {
				...rest,
				participants: {
					connect: participants.map((participant) => ({
						id: participant.userId,
					})),
				},
			},
		})

		if (!updatedWorkPermit) {
			return {
				ok: false,
				message: "Permiso de trabajo no encontrado",
			}
		}

		logActivity({
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
