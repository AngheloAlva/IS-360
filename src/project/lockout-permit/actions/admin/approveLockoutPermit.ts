"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES, LOCKOUT_PERMIT_STATUS } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { ApproveLockoutPermitSchema } from "@/project/lockout-permit/schemas/approve-lockout-permit.schema"

export const approveLockoutPermit = async ({
	id,
	approved,
	approvalNotes,
}: ApproveLockoutPermitSchema) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		return {
			ok: false,
			message: "No se pudo obtener la sesión del usuario",
		}
	}

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				lockoutPermit: ["update"],
			},
		},
	})

	if (!hasPermission.success) {
		return {
			ok: false,
			message: "No tienes permisos para aprobar solicitudes de bloqueo",
		}
	}

	try {
		const lockoutPermit = await prisma.lockoutPermit.update({
			where: { id },
			data: {
				approved,
				approvalNotes,
				approvalDate: new Date(),
				approvalTime: new Date().toLocaleTimeString(),
				status: approved ? LOCKOUT_PERMIT_STATUS.ACTIVE : LOCKOUT_PERMIT_STATUS.REJECTED,
			},
			select: {
				id: true,
				company: {
					select: {
						name: true,
					},
				},
				requestedBy: {
					select: {
						name: true,
						id: true,
					},
				},
				otNumberRef: {
					select: {
						otNumber: true,
					},
				},
			},
		})

		logActivity({
			userId: session.user.id,
			entityId: lockoutPermit.id,
			entityType: "LockoutPermit",
			module: MODULES.LOCKOUT_PERMITS,
			action: approved ? ACTIVITY_TYPE.APPROVE : ACTIVITY_TYPE.REJECT,
			metadata: {
				approved,
				approvalNotes,
				approvalDate: new Date(),
				approvalTime: new Date().toLocaleTimeString(),
				status: approved ? LOCKOUT_PERMIT_STATUS.ACTIVE : LOCKOUT_PERMIT_STATUS.REJECTED,
			},
		})

		return {
			ok: true,
			message: `Solicitud de bloqueo ${approved ? "aprobada" : "rechazada"} exitosamente`,
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al procesar la solicitud de bloqueo",
		}
	}
}
