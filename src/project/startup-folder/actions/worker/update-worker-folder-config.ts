"use server"

import { headers } from "next/headers"

import { updateWorkerFolderConfigSchema } from "../../schemas/update-worker-folder-config.schema"
import { DRIVER_WORKER_STRUCTURE, BASE_WORKER_STRUCTURE } from "@/lib/consts/worker-folder-structure"
import { MODULES, ACCESS_ROLE, DocumentCategory } from "@/generated/prisma/enums"
import { recomputeSubfolderStatus } from "../recompute-subfolder-status"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

const DRIVER_ONLY_DOCUMENT_TYPES = DRIVER_WORKER_STRUCTURE.documents
	.filter((d) => !BASE_WORKER_STRUCTURE.documents.some((bd) => bd.type === d.type))
	.map((d) => d.type)

export async function updateWorkerFolderConfig(data: {
	startupFolderId: string
	workerId: string
	newStatus: string
	isDriver: boolean
	reason: string
	confirmDeleteDriverDocs?: boolean
}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (session?.user?.accessRole !== ACCESS_ROLE.ADMIN) {
		return { ok: false, message: "No tienes permisos para realizar esta acción" }
	}

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				startupFolder: ["update"],
			},
		},
	})

	if (!hasPermission.success) {
		return { ok: false, message: "No tienes permisos para realizar esta acción" }
	}

	const validatedData = updateWorkerFolderConfigSchema.safeParse(data)

	if (!validatedData.success) {
		return { ok: false, message: "Datos inválidos" }
	}

	const { startupFolderId, workerId, newStatus, isDriver, reason, confirmDeleteDriverDocs } =
		validatedData.data

	try {
		const currentFolder = await prisma.workerFolder.findUnique({
			where: { workerId_startupFolderId: { workerId, startupFolderId } },
			select: { isDriver: true, status: true },
		})

		if (!currentFolder) {
			return { ok: false, message: "Carpeta de trabajador no encontrada" }
		}

		const currentIsDriver = currentFolder.isDriver ?? true
		const isRemovingDriver = currentIsDriver && !isDriver
		const statusChanged = currentFolder.status !== newStatus
		const driverChanged = currentIsDriver !== isDriver

		if (isRemovingDriver) {
			const existingDriverDocs = await prisma.workerDocument.findMany({
				where: {
					folder: { workerId, startupFolderId },
					type: { in: DRIVER_ONLY_DOCUMENT_TYPES },
				},
				select: { id: true, type: true },
			})

			if (existingDriverDocs.length > 0 && !confirmDeleteDriverDocs) {
				return {
					ok: false,
					requiresConfirmation: true,
					message: `Se eliminarán ${existingDriverDocs.length} documento(s) exclusivos de conductor`,
					documentsToDelete: existingDriverDocs.map((d) => d.type),
				}
			}

			if (existingDriverDocs.length > 0 && confirmDeleteDriverDocs) {
				await prisma.workerDocument.deleteMany({
					where: {
						id: { in: existingDriverDocs.map((d) => d.id) },
					},
				})
			}
		}

		await prisma.workerFolder.update({
			where: { workerId_startupFolderId: { workerId, startupFolderId } },
			data: {
				...(statusChanged && { status: newStatus as never }),
				...(driverChanged && { isDriver }),
			},
		})

		if (driverChanged) {
			await recomputeSubfolderStatus({
				category: DocumentCategory.PERSONNEL,
				workerId,
				startupFolderId,
			})
		}

		const startupFolder = await prisma.startupFolder.findUnique({
			where: { id: startupFolderId },
			include: { company: { select: { name: true } } },
		})

		if (startupFolder) {
			const changes: string[] = []
			if (statusChanged) changes.push(`estado: ${currentFolder.status} → ${newStatus}`)
			if (driverChanged) changes.push(`conductor: ${currentFolder.isDriver} → ${isDriver}`)

			await logActivity({
				action: "UPDATE",
				module: MODULES.STARTUP_FOLDERS,
				userId: session.user.id,
				entityType: "WorkerFolder",
				entityId: startupFolder.id,
				metadata: {
					startupFolderId,
					workerId,
					changes: changes.join(", "),
					reason,
					companyName: startupFolder.company.name,
				},
			})
		}

		return {
			ok: true,
			message: "Configuración actualizada exitosamente",
		}
	} catch (error) {
		console.error("Error updating worker folder config:", error)
		return { ok: false, message: "Error al actualizar la configuración de la carpeta" }
	}
}
