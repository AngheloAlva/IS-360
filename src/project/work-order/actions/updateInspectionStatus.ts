"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { INSPECTION_STATUS } from "@prisma/client"

interface UpdateInspectionStatusParams {
	userId: string
	workEntryId: string
	status: INSPECTION_STATUS
}

export async function updateInspectionStatus({
	userId,
	workEntryId,
	status,
}: UpdateInspectionStatusParams) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id || session.user.id !== userId) {
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

		await prisma.workEntry.update({
			where: { id: workEntryId },
			data: {
				inspectionStatus: status,
				...(status === "RESOLVED" && {
					resolvedAt: new Date(),
				}),
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
