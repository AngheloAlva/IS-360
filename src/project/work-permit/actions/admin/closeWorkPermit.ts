"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES, WORK_PERMIT_STATUS } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
	getScopedWorkPermitId,
	hasWorkPermitUpdatePermission,
} from "@/project/work-permit/utils/authorization"

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
	const hasPermission = await hasWorkPermitUpdatePermission(session.user.id)

	if (!hasPermission) {
		return {
			ok: false,
			message: "No tienes permisos para cerrar permisos de trabajo",
		}
	}

	try {
		const scopedWorkPermitId = await getScopedWorkPermitId({
			workPermitId,
			userId: session.user.id,
		})

		if (!scopedWorkPermitId) {
			return {
				ok: false,
				message: "Permiso de trabajo no encontrado",
			}
		}

		const workPermit = await prisma.workPermit.update({
			where: {
				id: scopedWorkPermitId,
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
						workBookName: true,
					},
				},
			},
		})

  await logActivity({
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
				workBookName: workPermit.otNumber?.workBookName,
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
