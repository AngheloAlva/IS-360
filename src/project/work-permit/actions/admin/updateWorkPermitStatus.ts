"use server"

import { headers } from "next/headers"
import { z } from "zod"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

const updateWorkPermitStatusSchema = z.object({
	id: z.string(),
	workCompleted: z.boolean(),
})

export async function updateWorkPermitStatus(data: z.infer<typeof updateWorkPermitStatusSchema>) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const { id, workCompleted } = updateWorkPermitStatusSchema.parse(data)

		const workPermit = await prisma.workPermit.update({
			where: { id },
			data: { workCompleted },
			select: {
				id: true,
				workCompleted: true,
				otNumber: {
					select: {
						otNumber: true,
						workName: true,
					},
				},
			},
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.WORK_PERMITS,
			action: workCompleted ? ACTIVITY_TYPE.COMPLETE : ACTIVITY_TYPE.UPDATE,
			entityId: workPermit.id,
			entityType: "WorkPermit",
			metadata: {
				workCompleted: workPermit.workCompleted,
				otNumber: workPermit.otNumber?.otNumber,
				workName: workPermit.otNumber?.workName,
			},
		})

		return {
			ok: true,
			message: workCompleted
				? "Permiso de trabajo completado exitosamente"
				: "Estado del permiso de trabajo actualizado exitosamente",
		}
	} catch (error) {
		console.error("[UPDATE_WORK_PERMIT_STATUS]", error)

		if (error instanceof z.ZodError) {
			return {
				ok: false,
				message: "Datos inválidos",
			}
		}

		return {
			ok: false,
			message: "Error al actualizar el estado del permiso de trabajo",
		}
	}
}
