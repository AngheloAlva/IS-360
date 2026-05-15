"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { ZeroEnergyReviewSchema } from "@/project/lockout-permit/schemas/zero-energy-review.schema"

interface CreateZeroEnergyReviewProps {
	values: ZeroEnergyReviewSchema
}

export const createZeroEnergyReview = async ({ values }: CreateZeroEnergyReviewProps) => {
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
		const { lockoutPermitId, equipmentId, action, location, reviewedZero } = values

		// Verificar que el permiso de bloqueo existe
		const lockoutPermit = await prisma.lockoutPermit.findUnique({
			where: { id: lockoutPermitId },
			select: {
				id: true,
				status: true,
				companyId: true,
			},
		})

		if (!lockoutPermit) {
			return {
				ok: false,
				message: "Permiso de bloqueo no encontrado",
			}
		}

		// Verificar que el equipo existe
		const equipment = await prisma.equipment.findUnique({
			where: { id: equipmentId },
			select: { id: true },
		})

		if (!equipment) {
			return {
				ok: false,
				message: "Equipo no encontrado",
			}
		}

		// Crear la revisión de energía cero
		const zeroEnergyReview = await prisma.zeroEnergyReview.create({
			data: {
				lockoutPermitId,
				equipmentId,
				action,
				location,
				reviewedZero: reviewedZero || false,
				performedById: session.user.id,
			},
		})

  await logActivity({
			userId: session.user.id,
			entityId: zeroEnergyReview.id,
			entityType: "ZeroEnergyReview",
			module: MODULES.LOCKOUT_PERMITS,
			action: ACTIVITY_TYPE.CREATE,
		})

		return {
			ok: true,
			message: "Revisión de energía cero creada exitosamente",
			data: zeroEnergyReview,
		}
	} catch (error) {
		console.error("[CREATE_ZERO_ENERGY_REVIEW]", error)
		return {
			ok: false,
			message: "Error al crear la revisión de energía cero",
		}
	}
}
