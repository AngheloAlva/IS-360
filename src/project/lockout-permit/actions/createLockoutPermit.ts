"use server"

import { headers } from "next/headers"

import { sendNotification } from "@/shared/actions/notifications/send-notification"
import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { USER_ROLE } from "@/lib/permissions"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { LockoutPermitSchema } from "@/project/lockout-permit/schemas/lockout-permit.schema"

interface CreateLockoutPermitProps {
	userId: string
	values: LockoutPermitSchema
}

export const createLockoutPermit = async ({ values, userId }: CreateLockoutPermitProps) => {
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
		const workOrder = await prisma.workOrder.findUnique({
			where: {
				id: values.otNumberId,
			},
			select: {
				id: true,
				equipments: {
					select: {
						id: true,
					},
				},
				company: {
					select: {
						id: true,
					},
				},
			},
		})

		if (!workOrder) {
			return {
				ok: false,
				message: "No se pudo obtener la OT",
			}
		}

		const { lockoutRegistrations, zeroEnergyReviews, activitiesToExecute, ...rest } = values

		const lockoutPermit = await prisma.lockoutPermit.create({
			data: {
				...rest,
				companyId: workOrder.company?.id || "",
				areaResponsibleId: values.areaResponsibleId,
				otNumberId: workOrder.id,
				requestedById: userId,
				equipments: {
					connect: workOrder.equipments.map((equipment) => ({ id: equipment.id })),
				},
				lockoutRegistrations: {
					create: lockoutRegistrations?.map((registration, i) => ({
						order: i + 1,
						...registration,
					})),
				},
				zeroEnergyReviews: {
					create: zeroEnergyReviews?.map((review) => ({
						action: review.action,
						location: review.location,
						reviewedZero: review.isZeroEnergyReview,
						equipment: {
							connect: {
								id: review.equipment,
							},
						},
						performedBy: {
							connect: {
								id: review.performedBy,
							},
						},
					})),
				},
				activitiesToExecute: activitiesToExecute.map((activity) => activity.activity),
			},
		})

		const completeLockoutPermit = await prisma.lockoutPermit.findUnique({
			where: { id: lockoutPermit.id },
			include: {
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
				requestedBy: {
					select: {
						name: true,
					},
				},
			},
		})

		const folderLink = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard/permisos-de-bloqueo`

		if (completeLockoutPermit) {
			sendNotification({
				link: folderLink,
				creatorId: userId,
				targetRoles: [USER_ROLE.admin, USER_ROLE.operator],
				type: "LOCKOUT_PERMIT_SUBMITTED",
				title: "Nueva solicitud de bloqueo",
				message: `La empresa ${completeLockoutPermit.company.name} ha creado una nueva solicitud de bloqueo${completeLockoutPermit.otNumberRef ? ` para la OT ${completeLockoutPermit.otNumberRef.otNumber}` : ""}`,
			})
		}

		logActivity({
			userId: session.user.id,
			entityId: lockoutPermit.id,
			entityType: "LockoutPermit",
			module: MODULES.LOCKOUT_PERMITS,
			action: ACTIVITY_TYPE.CREATE,
		})

		return {
			ok: true,
			message: "Solicitud de bloqueo creada exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al crear la solicitud de bloqueo",
		}
	}
}
