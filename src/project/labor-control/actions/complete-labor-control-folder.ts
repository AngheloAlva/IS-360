"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES, LABOR_CONTROL_STATUS } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface CompleteFolderParams {
	startupFolderId: string
}

export const completeLaborControlFolder = async ({ startupFolderId }: CompleteFolderParams) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return { ok: false, message: "No autorizado - Sesión no encontrada" }
	}

	try {
		const folder = await prisma.laborControlFolder.update({
			where: { id: startupFolderId },
			data: { status: LABOR_CONTROL_STATUS.APPROVED },
			select: {
				id: true,
				company: {
					select: {
						name: true,
						users: {
							where: {
								isActive: true,
								isSupervisor: true,
							},
							select: {
								email: true,
							},
						},
					},
				},
			},
		})

		logActivity({
			entityId: folder.id,
			userId: session.user.id,
			action: ACTIVITY_TYPE.COMPLETE,
			entityType: "LaborControlFolder",
			module: MODULES.LABOR_CONTROL_FOLDERS,
			metadata: {
				companyName: folder.company.name,
			},
		})

		if (!folder) {
			return { ok: false, message: "Carpeta de control laboral no encontrada" }
		}

		return { ok: true, message: "Carpeta de control laboral completada correctamente" }
	} catch (error) {
		console.error("Error al completar la carpeta de control laboral:", error)
		return { ok: false, message: "Error al completar la carpeta de control laboral" }
	}
}
