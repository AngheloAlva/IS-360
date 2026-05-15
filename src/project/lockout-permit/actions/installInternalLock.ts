"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { InstallInternalLockSchema } from "@/project/lockout-permit/schemas/install-internal-lock.schema"

interface InstallInternalLockProps {
	values: InstallInternalLockSchema
}

export const installInternalLock = async ({ values }: InstallInternalLockProps) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		return {
			ok: false,
			message: "No se pudo obtener la sesión del usuario",
		}
	}

	if (session.user.accessRole !== "ADMIN" && session.user.accessRole !== "OPERATOR") {
		return {
			ok: false,
			message: "No tienes permisos para instalar candados internos",
		}
	}

	try {
		const { lockoutPermitId, internalOperatorId, internalLockNumber } = values

		// Verificar que el registro existe
		const lockoutPermit = await prisma.lockoutPermit.findUnique({
			where: { id: lockoutPermitId },
			select: {
				id: true,
				status: true,
				workPermitId: true,
			},
		})

		if (!lockoutPermit) {
			return {
				ok: false,
				message: "Registro de bloqueo no encontrado",
			}
		}

		// Verificar que el permiso de bloqueo esté aprobado
		// if (lockoutPermit.lockoutPermit.status !== "ACTIVE") {
		// 	return {
		// 		ok: false,
		// 		message: "El permiso de bloqueo debe estar aprobado antes de instalar candados",
		// 	}
		// }

		// Registrar fecha y hora actual
		const now = new Date()
		const timeString = now.toLocaleTimeString("es-CL", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		})

		// Actualizar el registro con el candado interno
		await prisma.lockoutRegistration.create({
			data: {
				order: 1,
				internalOperatorId,
				internalLockNumber,
				lockoutPermitId,
				internalInstallDate: now,
				rut: session.user.rut,
				name: session.user.name,
				internalInstallTime: timeString,
			},
		})

  await logActivity({
			userId: session.user.id,
			entityId: lockoutPermit.id,
			action: ACTIVITY_TYPE.CREATE,
			module: MODULES.LOCKOUT_PERMITS,
			entityType: "LockoutRegistration",
		})

		return {
			ok: true,
			message: "Candado Interno instalado exitosamente",
		}
	} catch (error) {
		console.error("[INSTALL_INTERNAL_LOCK]", error)
		return {
			ok: false,
			message: "Error al instalar el candado interno",
		}
	}
}
