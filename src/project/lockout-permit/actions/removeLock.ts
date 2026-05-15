"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { RemoveLockSchema } from "@/project/lockout-permit/schemas/remove-lock.schema"

interface RemoveLockProps {
	values: RemoveLockSchema
}

export const removeLock = async ({ values }: RemoveLockProps) => {
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
		const { lockoutRegistrationId, lockType } = values

		// Verificar que el registro existe
		const registration = await prisma.lockoutRegistration.findUnique({
			where: { id: lockoutRegistrationId },
			include: {
				lockoutPermit: {
					select: {
						id: true,
						status: true,
						companyId: true,
						workPermitId: true,
					},
				},
			},
		})

		if (!registration) {
			return {
				ok: false,
				message: "Registro de bloqueo no encontrado",
			}
		}

		// Verificar permisos según el tipo de candado
		if (lockType === "otc") {
			// Solo OTC puede retirar su candado
			if (session.user.accessRole !== "ADMIN" && session.user.accessRole !== "OPERATOR") {
				return {
					ok: false,
					message: "No tienes permisos para retirar candados de OTC",
				}
			}

			// Verificar que el candado OTC esté instalado
			if (!registration.otcLockNumber) {
				return {
					ok: false,
					message: "No hay candado de OTC instalado en este registro",
				}
			}

			// Verificar que ya se haya retirado
			if (registration.otcRemoveDate) {
				return {
					ok: false,
					message: "El candado de OTC ya ha sido retirado",
				}
			}
		} else {
			// El contratista solo puede retirar su propio candado
			if (
				session.user.accessRole === "PARTNER_COMPANY" &&
				session.user.companyId !== registration.lockoutPermit.companyId
			) {
				return {
					ok: false,
					message: "No tienes permisos para retirar candados en este registro",
				}
			}

			// Verificar que el candado del contratista esté instalado
			if (!registration.contractorLockNumber) {
				return {
					ok: false,
					message: "No hay candado del contratista instalado en este registro",
				}
			}

			// Verificar que ya se haya retirado
			if (registration.contractorRemoveDate) {
				return {
					ok: false,
					message: "El candado del contratista ya ha sido retirado",
				}
			}
		}

		// Verificar que AMBOS candados estén instalados antes de permitir el retiro
		if (!registration.otcLockNumber || !registration.contractorLockNumber) {
			return {
				ok: false,
				message: "Ambos candados (OTC y contratista) deben estar instalados antes de retirar",
			}
		}

		// Registrar fecha y hora actual
		const now = new Date()
		const timeString = now.toLocaleTimeString("es-CL", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		})

		// Actualizar el registro según el tipo de candado
		const updateData =
			lockType === "otc"
				? {
						otcRemoveDate: now,
						otcRemoveTime: timeString,
					}
				: {
						contractorRemoveDate: now,
						contractorRemoveTime: timeString,
					}

		await prisma.lockoutRegistration.update({
			where: { id: lockoutRegistrationId },
			data: updateData,
		})

		// Verificar si todos los registros del permiso están completados
		const allRegistrations = await prisma.lockoutRegistration.findMany({
			where: { lockoutPermitId: registration.lockoutPermit.id },
		})

		const allCompleted = allRegistrations.every(
			(reg) => reg.otcRemoveDate && reg.contractorRemoveDate
		)

		// Si todos los registros están completados, marcar el permiso como completado
		if (allCompleted) {
			await prisma.lockoutPermit.update({
				where: { id: registration.lockoutPermit.id },
				data: { status: "COMPLETED" },
			})
		}

  await logActivity({
			userId: session.user.id,
			entityId: registration.lockoutPermit.id,
			entityType: "LockoutPermit",
			module: MODULES.LOCKOUT_PERMITS,
			action: ACTIVITY_TYPE.UPDATE,
		})

		return {
			ok: true,
			message: `Candado ${lockType === "otc" ? "de OTC" : "del contratista"} retirado exitosamente`,
		}
	} catch (error) {
		console.error("[REMOVE_LOCK]", error)
		return {
			ok: false,
			message: "Error al retirar el candado",
		}
	}
}
