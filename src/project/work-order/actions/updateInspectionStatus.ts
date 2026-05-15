"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { createDiff } from "@/lib/activity/diff"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { INSPECTION_STATUS } from "@/generated/prisma/enums"

interface UpdateInspectionStatusParams {
	workEntryId: string
	status: INSPECTION_STATUS
}

export async function updateInspectionStatus({
	workEntryId,
	status,
}: UpdateInspectionStatusParams) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				workOrder: ["update"],
			},
		},
	})

	if (!hasPermission.success) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const workEntry = await prisma.workEntry.findUnique({
			where: { id: workEntryId },
			select: {
				id: true,
				entryType: true,
				inspectionStatus: true,
				workOrder: {
					select: {
						id: true,
						responsibleId: true,
						supervisorId: true,
					},
				},
			},
		})

		if (!workEntry) {
			return {
				ok: false,
				message: "Entrada no encontrada",
			}
		}

		if (workEntry.entryType !== "OTC_INSPECTION") {
			return {
				ok: false,
				message: "Solo se puede cambiar el estado de inspecciones OTC",
			}
		}

		const resolvedAt = status === "RESOLVED" ? new Date() : null

		await prisma.workEntry.update({
			where: { id: workEntryId },
			data: {
				inspectionStatus: status,
				...(resolvedAt && {
					resolvedAt,
				}),
			},
		})

		const diff = createDiff(
			{ inspectionStatus: workEntry.inspectionStatus },
			{ inspectionStatus: status }
		)

  await logActivity({
			userId: session.user.id,
			module: MODULES.WORK_ORDERS,
			action: status === "RESOLVED" ? ACTIVITY_TYPE.COMPLETE : ACTIVITY_TYPE.UPDATE,
			entityId: workEntry.id,
			entityType: "Inspection",
			...diff,
			metadata: {
				resolvedAt,
				workOrderId: workEntry.workOrder?.id,
			},
		})

		return {
			ok: true,
			message: `Inspección marcada como ${status === "RESOLVED" ? "resuelta" : "reportada"} correctamente`,
		}
	} catch (error) {
		console.error("Error updating inspection status:", error)
		return {
			ok: false,
			message: "Error interno del servidor",
		}
	}
}
