"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { InstallContractorLockSchema } from "@/project/lockout-permit/schemas/install-contractor-lock.schema"

interface InstallContractorLockProps {
	values: InstallContractorLockSchema
}

export const installContractorLock = async ({ values }: InstallContractorLockProps) => {
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
		const { lockoutPermitId, contractorLockNumber } = values

		// Verificar que el permiso de bloqueo existe
		const lockoutPermit = await prisma.lockoutPermit.findUnique({
			where: { id: lockoutPermitId },
			select: {
				id: true,
				status: true,
				companyId: true,
				workPermitId: true,
			},
		})

		if (!lockoutPermit) {
			return {
				ok: false,
				message: "Permiso de bloqueo no encontrado",
			}
		}

		// Verificar que el usuario pertenezca a la empresa del permiso
		if (
			session.user.accessRole === "PARTNER_COMPANY" &&
			session.user.companyId !== lockoutPermit.companyId
		) {
			return {
				ok: false,
				message: "No tienes permisos para instalar candados en este permiso",
			}
		}

		// Registrar fecha y hora actual
		const now = new Date()
		const timeString = now.toLocaleTimeString("es-CL", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		})

		// Crear un nuevo registro con el candado del contratista
		await prisma.lockoutRegistration.create({
			data: {
				order: 1,
				rut: session.user.rut,
				name: session.user.name,
				lockoutPermitId,
				contractorLockNumber,
				contractorInstallDate: now,
				contractorInstallTime: timeString,
			},
		})

  await logActivity({
			userId: session.user.id,
			entityId: lockoutPermit.id,
			entityType: "LockoutRegistration",
			module: MODULES.LOCKOUT_PERMITS,
			action: ACTIVITY_TYPE.CREATE,
		})

		return {
			ok: true,
			message: "Candado del contratista instalado exitosamente",
		}
	} catch (error) {
		console.error("[INSTALL_CONTRACTOR_LOCK]", error)
		return {
			ok: false,
			message: "Error al instalar el candado del contratista",
		}
	}
}
