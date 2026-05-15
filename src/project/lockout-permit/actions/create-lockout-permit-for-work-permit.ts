"use server"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { LockoutPermitSchema } from "@/project/lockout-permit/schemas/lockout-permit.schema"

interface CreateLockoutPermitForWorkPermitProps {
	workPermitId: string
	values: LockoutPermitSchema
}

export const createLockoutPermitForWorkPermit = async ({
	workPermitId,
	values,
}: CreateLockoutPermitForWorkPermitProps) => {
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
		const workPermit = await prisma.workPermit.findUnique({
			where: { id: workPermitId },
			select: {
				id: true,
				companyId: true,
				userId: true,
				otNumberId: true,
			},
		})

		if (!workPermit) {
			return {
				ok: false,
				message: "No se pudo obtener el permiso de trabajo",
			}
		}

		const { lockoutRecords, lockoutActivities, lockoutEquipments, ...rest } = values

		const userIds = lockoutRecords.map((r) => r.userId)
		const users = await prisma.user.findMany({
			where: { id: { in: userIds } },
			select: { id: true, name: true, rut: true },
		})

		const lockoutPermit = await prisma.lockoutPermit.create({
			data: {
				lockoutType: rest.lockoutType,
				lockoutTypeOther: rest.lockoutTypeOther,
				startDate: rest.startDate || new Date(),
				endDate: rest.endDate,
				finalObservations: rest.lockoutFinalObservations,
				companyId: workPermit.companyId,
				requestedById: workPermit.userId,
				workPermitId: workPermit.id,
				otNumberId: workPermit.otNumberId,
				areaResponsibleId: values.lockoutAreaResponsibleId || workPermit.userId,
				activitiesToExecute: lockoutActivities.map((activity) => activity.activity),
				equipments: {
					connect: lockoutEquipments.map((equipmentId) => ({ id: equipmentId })),
				},
				lockoutRegistrations: {
					create: lockoutRecords?.map((record, i) => {
						const user = users.find((u) => u.id === record.userId)
						return {
							order: i + 1,
							name: user?.name || "",
							rut: user?.rut || "",
							contractorId: record.userId,
							contractorLockNumber: record.contractorLockNumber,
							contractorInstallDate: record.installDate,
							contractorInstallTime: record.installTime,
						}
					}),
				},
			},
		})

  await logActivity({
			userId: session.user.id,
			entityId: lockoutPermit.id,
			entityType: "LockoutPermit",
			module: MODULES.LOCKOUT_PERMITS,
			action: ACTIVITY_TYPE.CREATE,
		})

		return {
			ok: true,
			lockoutPermitId: lockoutPermit.id,
			message: "Permiso de bloqueo creado exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al crear el permiso de bloqueo",
		}
	}
}
