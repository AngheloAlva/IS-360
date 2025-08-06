"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES, ReviewStatus } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export interface UpdateVehicleDocumentToUpdateParams {
	documentIds: string[]
	startupFolderId: string
}

export async function updateVehicleDocumentToUpdate({
	documentIds,
	startupFolderId,
}: UpdateVehicleDocumentToUpdateParams) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	// Verify user has permission to update documents
	const startupFolder = await prisma.startupFolder.findUnique({
		where: { id: startupFolderId },
		select: {
			companyId: true,
		},
	})

	if (!startupFolder) {
		return { ok: false, message: "Carpeta de arranque no encontrada" }
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
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		// Actualizar múltiples documentos
		const updatedDocuments = await prisma.vehicleDocument.updateMany({
			where: {
				id: {
					in: documentIds,
				},
			},
			data: {
				status: ReviewStatus.TO_UPDATE,
				reviewNotes: null,
				reviewedAt: null,
				reviewerId: null,
			},
		})

		if (updatedDocuments.count === 0) {
			return {
				ok: false,
				message: "No se encontraron documentos para actualizar",
			}
		}

		// Obtener información de los documentos para logging
		const documents = await prisma.vehicleDocument.findMany({
			where: {
				id: {
					in: documentIds,
				},
			},
			select: {
				id: true,
				name: true,
				folder: {
					select: {
						startupFolderId: true,
						startupFolder: {
							select: {
								companyId: true,
							},
						},
					},
				},
			},
		})

		// Actualizar estado de la carpeta si es necesario
		if (documents.length > 0) {
			const startupFolderId = documents[0].folder.startupFolderId
			const companyId = documents[0].folder.startupFolder.companyId

			// Verificar si todos los documentos están en estado TO_UPDATE, APPROVED o REJECTED
			const folderDocuments = await prisma.vehicleDocument.findMany({
				where: {
					folder: {
						startupFolderId,
					},
				},
				select: {
					status: true,
					folder: {
						select: {
							vehicleId: true,
						},
					},
				},
			})

			const hasSubmittedDocuments = folderDocuments.some((doc) => doc.status === "SUBMITTED")

			if (!hasSubmittedDocuments && folderDocuments.length > 0) {
				await prisma.vehicleFolder.update({
					where: {
						vehicleId_startupFolderId: {
							vehicleId: folderDocuments[0].folder.vehicleId,
							startupFolderId,
						},
					},
					data: {
						status: ReviewStatus.DRAFT,
					},
				})
			}

			// Registrar actividad para cada documento
			for (const document of documents) {
				await logActivity({
					userId: session.user.id,
					module: MODULES.STARTUP_FOLDERS,
					action: ACTIVITY_TYPE.UPDATE,
					entityId: document.id,
					entityType: "VehicleDocument",
					metadata: {
						documentName: document.name,
						companyId,
						action: "marked_for_update",
					},
				})
			}
		}

		return {
			ok: true,
			message: `${documentIds.length} documentos marcados para actualización correctamente`,
		}
	} catch (error) {
		console.error("Error updating vehicle documents to update status:", error)
		return {
			ok: false,
			message: "Error interno del servidor",
		}
	}
}
