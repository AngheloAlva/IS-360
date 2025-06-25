"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface DeleteWorkerFolderProps {
	folderId: string
	workerId: string
}

export const deleteWorkerFolder = async ({ folderId, workerId }: DeleteWorkerFolderProps) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return { ok: false, message: "No autorizado - Sesión no encontrada" }
	}

	try {
		const folder = await prisma.workerFolder.findUnique({
			where: { workerId_startupFolderId: { startupFolderId: folderId, workerId } },
			select: {
				id: true,
				worker: true,
				documents: true,
			},
		})

		if (!folder) {
			return { ok: false, message: "Carpeta de personal no encontrada" }
		}

		if (folder.documents.length > 0) {
			await Promise.all(
				folder.documents.map(async (document) => {
					await prisma.workerDocument.delete({
						where: { id: document.id },
					})
				})
			)
		}

		await prisma.workerFolder.delete({
			where: { id: folder.id },
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.DELETE,
			entityId: folderId,
			entityType: "WorkerFolder",
			metadata: {
				workerId,
				folderId,
			},
		})

		return { ok: true, message: "Carpeta de personal eliminada correctamente" }
	} catch (error) {
		console.error("Error al eliminar la carpeta:", error)
		return { ok: false, message: "Error al procesar la solicitud" }
	}
}

interface DeleteVehicleFolderProps {
	folderId: string
	vehicleId: string
}

export const deleteVehicleFolder = async ({ folderId, vehicleId }: DeleteVehicleFolderProps) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return { ok: false, message: "No autorizado - Sesión no encontrada" }
	}

	try {
		const folder = await prisma.vehicleFolder.findUnique({
			where: { vehicleId_startupFolderId: { startupFolderId: folderId, vehicleId } },
			select: {
				id: true,
				vehicle: true,
				documents: true,
			},
		})

		if (!folder) {
			return { ok: false, message: "Carpeta de vehiculo no encontrada" }
		}

		if (folder.documents.length > 0) {
			await Promise.all(
				folder.documents.map(async (document) => {
					await prisma.vehicleDocument.delete({
						where: { id: document.id },
					})
				})
			)
		}

		await prisma.vehicleFolder.delete({
			where: { id: folder.id },
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.DELETE,
			entityId: folderId,
			entityType: "VehicleFolder",
			metadata: {
				vehicleId,
				folderId,
			},
		})

		return { ok: true, message: "Carpeta de vehiculo eliminada correctamente" }
	} catch (error) {
		console.error("Error al eliminar la carpeta:", error)
		return { ok: false, message: "Error al procesar la solicitud" }
	}
}
