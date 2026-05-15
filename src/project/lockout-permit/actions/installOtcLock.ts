"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { InstallOtcLockSchema } from "@/project/lockout-permit/schemas/install-otc-lock.schema"

interface InstallOtcLockProps {
	values: InstallOtcLockSchema
}

export const installOtcLock = async ({ values }: InstallOtcLockProps) => {
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
			message: "No tienes permisos para instalar candados de OTC",
		}
	}

	try {
		const { lockoutPermitId, otcOperatorId, otcLockNumber } = values

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

		// Actualizar el registro con el candado de OTC
		await prisma.lockoutRegistration.create({
			data: {
				order: 1,
				otcOperatorId,
				otcLockNumber,
				lockoutPermitId,
				otcInstallDate: now,
				rut: session.user.rut,
				name: session.user.name,
				otcInstallTime: timeString,
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
			message: "Candado de OTC instalado exitosamente",
		}
	} catch (error) {
		console.error("[INSTALL_OTC_LOCK]", error)
		return {
			ok: false,
			message: "Error al instalar el candado de OTC",
		}
	}
}
