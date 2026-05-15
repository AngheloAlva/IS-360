"use server"

import { ACTIVITY_TYPE, LOCKOUT_PERMIT_STATUS, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import {
	updateLockoutPermitStatusSchema,
	type UpdateLockoutPermitStatusSchema,
} from "../schemas/update-lockout-permit-status.schema"

export async function updateLockoutPermitStatus(values: UpdateLockoutPermitStatusSchema) {
	const headersList = await headers()
	const session = await auth.api.getSession({ headers: headersList })

	if (!session?.user) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const validatedData = updateLockoutPermitStatusSchema.parse(values)

		const lockoutPermit = await prisma.lockoutPermit.findUnique({
			where: { id: validatedData.lockoutPermitId },
		})

		if (!lockoutPermit) {
			return {
				ok: false,
				message: "Permiso de bloqueo no encontrado",
			}
		}

		const now = new Date()
		const updateData: {
			status: LOCKOUT_PERMIT_STATUS
			approvalNotes?: string
			approved?: boolean
			approvalDate?: Date
			approvalTime?: string
		} = {
			status: validatedData.status,
			approvalNotes: validatedData.approvalNotes,
		}

		// Si se aprueba, marcamos como aprobado
		if (validatedData.status === LOCKOUT_PERMIT_STATUS.ACTIVE) {
			updateData.approved = true
			updateData.approvalDate = now
			updateData.approvalTime = now.toLocaleTimeString("es-CL", {
				hour: "2-digit",
				minute: "2-digit",
			})
		}

		// Si se rechaza, marcamos como no aprobado
		if (validatedData.status === LOCKOUT_PERMIT_STATUS.REJECTED) {
			updateData.approved = false
			updateData.approvalDate = now
			updateData.approvalTime = now.toLocaleTimeString("es-CL", {
				hour: "2-digit",
				minute: "2-digit",
			})
		}

		await prisma.lockoutPermit.update({
			where: { id: validatedData.lockoutPermitId },
			data: updateData,
		})

  await logActivity({
			userId: session.user.id,
			entityId: lockoutPermit.id,
			entityType: "LockoutPermit",
			module: MODULES.LOCKOUT_PERMITS,
			action: ACTIVITY_TYPE.UPDATE,
		})

		const statusMessages = {
			[LOCKOUT_PERMIT_STATUS.ACTIVE]: "aprobado",
			[LOCKOUT_PERMIT_STATUS.REJECTED]: "rechazado",
			[LOCKOUT_PERMIT_STATUS.COMPLETED]: "completado",
			[LOCKOUT_PERMIT_STATUS.REVIEW_PENDING]: "marcado como pendiente de revisión",
		}

		return {
			ok: true,
			message: `Permiso de bloqueo ${statusMessages[validatedData.status]} exitosamente`,
		}
	} catch (error) {
		console.error("Error al actualizar estado del permiso de bloqueo:", error)
		return {
			ok: false,
			message: "Error al actualizar el estado del permiso de bloqueo",
		}
	}
}
