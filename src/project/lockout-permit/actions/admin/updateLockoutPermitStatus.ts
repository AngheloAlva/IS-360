"use server"

import { headers } from "next/headers"
import { z } from "zod"

import { ACTIVITY_TYPE, MODULES, LOCKOUT_PERMIT_STATUS } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

const updateLockoutPermitStatusSchema = z.object({
	id: z.string(),
	status: z.nativeEnum(LOCKOUT_PERMIT_STATUS),
	approvalNotes: z.string().optional(),
})

export async function updateLockoutPermitStatus(data: z.infer<typeof updateLockoutPermitStatusSchema>) {
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
		const { id, status, approvalNotes } = updateLockoutPermitStatusSchema.parse(data)

		// Validar que solo admin puedan cambiar estados
		if (session.user.accessRole !== "ADMIN") {
			return {
				ok: false,
				message: "No tienes permisos para cambiar el estado de permisos de bloqueo",
			}
		}

		const updateData: Record<string, unknown> = {
			status,
			...(approvalNotes && { approvalNotes }),
		}

		// Si se está aprobando, agregar datos de aprobación
		if (status === LOCKOUT_PERMIT_STATUS.ACTIVE) {
			updateData.approved = true
			updateData.approvalDate = new Date()
			updateData.approvalTime = new Date().toLocaleTimeString()
		}

		// Si se está rechazando
		if (status === LOCKOUT_PERMIT_STATUS.REJECTED) {
			updateData.approved = false
			updateData.approvalDate = new Date()
			updateData.approvalTime = new Date().toLocaleTimeString()
		}

		const lockoutPermit = await prisma.lockoutPermit.update({
			where: { id },
			data: updateData,
			select: {
				id: true,
				status: true,
				lockoutType: true,
				otNumberRef: {
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

		logActivity({
			userId: session.user.id,
			module: MODULES.LOCKOUT_PERMITS,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: lockoutPermit.id,
			entityType: "LockoutPermit",
			metadata: {
				status: lockoutPermit.status,
				lockoutType: lockoutPermit.lockoutType,
				otNumber: lockoutPermit.otNumberRef?.otNumber,
				companyName: lockoutPermit.company.name,
				approvalNotes,
			},
		})

		const statusMessages = {
			[LOCKOUT_PERMIT_STATUS.ACTIVE]: "Permiso de bloqueo aprobado exitosamente",
			[LOCKOUT_PERMIT_STATUS.REJECTED]: "Permiso de bloqueo rechazado",
			[LOCKOUT_PERMIT_STATUS.COMPLETED]: "Permiso de bloqueo completado exitosamente",
			[LOCKOUT_PERMIT_STATUS.REVIEW_PENDING]: "Permiso de bloqueo enviado a revisión",
		}

		return {
			ok: true,
			message: statusMessages[status] || "Estado del permiso de bloqueo actualizado exitosamente",
		}
	} catch (error) {
		console.error("[UPDATE_LOCKOUT_PERMIT_STATUS]", error)

		if (error instanceof z.ZodError) {
			return {
				ok: false,
				message: "Datos inválidos",
			}
		}

		return {
			ok: false,
			message: "Error al actualizar el estado del permiso de bloqueo",
		}
	}
}
