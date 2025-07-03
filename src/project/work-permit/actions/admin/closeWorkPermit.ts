"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES, WORK_PERMIT_STATUS } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { CloseWorkPermitSchema } from "../../schemas/close-work-permit.schema"

interface CloseWorkPermitProps {
	workPermitId: string
	values: CloseWorkPermitSchema
}

export const closeWorkPermit = async ({ values, workPermitId }: CloseWorkPermitProps) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	const { closedBy } = values

	try {
		const workPermit = await prisma.workPermit.update({
			where: {
				id: workPermitId,
			},
			data: {
				status: WORK_PERMIT_STATUS.COMPLETED,
				closingDate: new Date(),
				closingBy: {
					connect: {
						id: closedBy,
					},
				},
			},
			select: {
				id: true,
				status: true,
				closingDate: true,
				closingById: true,
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
			action: ACTIVITY_TYPE.COMPLETE,
			entityId: workPermit.id,
			entityType: "WorkPermit",
			metadata: {
				status: workPermit.status,
				closingDate: workPermit.closingDate,
				closingById: workPermit.closingById,
				otNumber: workPermit.otNumber?.otNumber,
				workName: workPermit.otNumber?.workName,
			},
		})

		return {
			ok: true,
			message: "Permiso de trabajo cerrado exitosamente",
		}
	} catch (error) {
		console.error("[CLOSE_WORK_PERMIT]", error)
		return {
			ok: false,
			message: "Error al cerrar el permiso de trabajo",
		}
	}
}
