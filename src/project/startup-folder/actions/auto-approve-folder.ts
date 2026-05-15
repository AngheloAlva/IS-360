"use server"

import { ACTIVITY_TYPE, MODULES, ReviewStatus } from "@/generated/prisma/enums"
import { BASIC_FOLDER_STRUCTURE } from "@/lib/consts/basic-startup-folders-structure"
import { createDiff } from "@/lib/activity/diff"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"
import { SYSTEM_USER_ID } from "@/lib/consts/system-user"
import {
	BASE_WORKER_STRUCTURE,
	DRIVER_WORKER_STRUCTURE,
} from "@/lib/consts/worker-folder-structure"

export async function autoApproveBasicFolderIfReady(
	workerId: string,
	startupFolderId: string
): Promise<boolean> {
	try {
		const folder = await prisma.basicFolder.findUnique({
			where: {
				workerId_startupFolderId: { workerId, startupFolderId },
			},
			select: {
				id: true,
				status: true,
				documents: {
					select: {
						status: true,
					},
				},
			},
		})

		if (!folder) {
			return false
		}

		if (folder.status === ReviewStatus.APPROVED) {
			return true
		}

		const totalDocuments = BASIC_FOLDER_STRUCTURE.documents.length

		const allApproved =
			folder.documents.every(
				(d) => d.status === ReviewStatus.APPROVED || d.status === ReviewStatus.NOT_APPLIED
			) && folder.documents.length >= totalDocuments

		if (allApproved) {
			await prisma.basicFolder.update({
				where: {
					workerId_startupFolderId: { workerId, startupFolderId },
				},
				data: {
					status: ReviewStatus.APPROVED,
					reviewerId: SYSTEM_USER_ID,
				},
			})

			const diff = createDiff(
				{ status: folder.status, reviewerId: null },
				{ status: ReviewStatus.APPROVED, reviewerId: SYSTEM_USER_ID }
			)

   await logActivity({
				userId: SYSTEM_USER_ID,
				module: MODULES.STARTUP_FOLDERS,
				action: ACTIVITY_TYPE.APPROVE,
				entityId: folder.id,
				entityType: "BasicFolder",
				...diff,
				metadata: {
					autoApproved: true,
					reason: "Todos los documentos de la carpeta básica están aprobados o no aplican",
					workerId,
					startupFolderId,
					totalDocuments,
				},
			})

			console.log(
				`Auto-approved BasicFolder for worker ${workerId} in startup folder ${startupFolderId}`
			)
			return true
		}

		return false
	} catch (error) {
		console.error("Error auto-approving basic folder:", error)
		return false
	}
}

/**
 * Verifica si una carpeta de trabajador (FULL) tiene todos sus documentos aprobados
 * y la aprueba automáticamente si es así
 */
export async function autoApproveWorkerFolderIfReady(
	workerId: string,
	startupFolderId: string
): Promise<boolean> {
	try {
		const folder = await prisma.workerFolder.findUnique({
			where: {
				workerId_startupFolderId: { workerId, startupFolderId },
			},
			select: {
				id: true,
				status: true,
				isDriver: true,
				documents: {
					select: {
						status: true,
					},
				},
			},
		})

		if (!folder) {
			return false
		}

		if (folder.status === ReviewStatus.APPROVED) {
			return true
		}

		const totalDocuments = folder.isDriver
			? DRIVER_WORKER_STRUCTURE.documents.length
			: BASE_WORKER_STRUCTURE.documents.length

		const allApproved =
			folder.documents.every(
				(d) => d.status === ReviewStatus.APPROVED || d.status === ReviewStatus.NOT_APPLIED
			) && folder.documents.length >= totalDocuments

		if (allApproved) {
			await prisma.workerFolder.update({
				where: {
					workerId_startupFolderId: { workerId, startupFolderId },
				},
				data: {
					status: ReviewStatus.APPROVED,
					reviewerId: SYSTEM_USER_ID,
				},
			})

			const diff = createDiff(
				{ status: folder.status, reviewerId: null },
				{ status: ReviewStatus.APPROVED, reviewerId: SYSTEM_USER_ID }
			)

   await logActivity({
				userId: SYSTEM_USER_ID,
				module: MODULES.STARTUP_FOLDERS,
				action: ACTIVITY_TYPE.APPROVE,
				entityId: folder.id,
				entityType: "WorkerFolder",
				...diff,
				metadata: {
					autoApproved: true,
					reason: "Todos los documentos del trabajador están aprobados o no aplican",
					workerId,
					startupFolderId,
					isDriver: folder.isDriver,
					totalDocuments,
				},
			})

			console.log(
				`Auto-approved WorkerFolder for worker ${workerId} in startup folder ${startupFolderId}`
			)
			return true
		}

		return false
	} catch (error) {
		console.error("Error auto-approving worker folder:", error)
		return false
	}
}
