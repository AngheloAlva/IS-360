"use server"

import { headers } from "next/headers"

import { MODULES, ACTIVITY_TYPE, ReviewStatus, DocumentCategory } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
	unmarkDocumentAsNotAppliedSchema,
	type UnmarkDocumentAsNotAppliedInput,
} from "../schemas/unmark-document-not-applied.schema"

export async function unmarkStartupFolderDocumentAsNotApplied(
	input: UnmarkDocumentAsNotAppliedInput
): Promise<{ ok: boolean; message?: string }> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user) {
			return {
				ok: false,
				message: "No se encontró usuario",
			}
		}

		const { userId, folderId, documentId, category, workerId, vehicleId } =
			unmarkDocumentAsNotAppliedSchema.parse(input)

		const startupFolder = await prisma.startupFolder.findUnique({
			where: { id: folderId },
			select: {
				id: true,
				companyId: true,
			},
		})

		if (!startupFolder) {
			return {
				ok: false,
				message: "Carpeta de arranque no encontrada",
			}
		}

		const user = await prisma.user.findUnique({ where: { id: userId } })
		if (!user || (user.companyId !== startupFolder.companyId && user.accessRole !== "ADMIN")) {
			return {
				ok: false,
				message: "No autorizado - El usuario no pertenece a esta empresa",
			}
		}

		let deletedDocument: { id: string; name: string; type: string } | null = null

		switch (category as DocumentCategory) {
			case DocumentCategory.SAFETY_AND_HEALTH: {
				const folder = await prisma.safetyAndHealthFolder.findUnique({
					where: { startupFolderId: folderId },
					select: { id: true },
				})

				if (!folder) {
					return { ok: false, message: "Subcarpeta no encontrada" }
				}

				const document = await prisma.safetyAndHealthDocument.findFirst({
					where: { id: documentId, folderId: folder.id },
					select: { id: true, name: true, type: true, status: true },
				})

				if (!document) {
					return { ok: false, message: "Documento no encontrado" }
				}

				if (document.status !== ReviewStatus.NOT_APPLIED) {
					return {
						ok: false,
						message: "Solo se puede revertir documentos en estado 'No Aplica'",
					}
				}

				await prisma.safetyAndHealthDocument.delete({ where: { id: document.id } })
				deletedDocument = { id: document.id, name: document.name, type: document.type }
				break
			}

			case DocumentCategory.ENVIRONMENTAL: {
				const folder = await prisma.environmentalFolder.findUnique({
					where: { startupFolderId: folderId },
					select: { id: true },
				})

				if (!folder) {
					return { ok: false, message: "Subcarpeta no encontrada" }
				}

				const document = await prisma.environmentalDocument.findFirst({
					where: { id: documentId, folderId: folder.id },
					select: { id: true, name: true, type: true, status: true },
				})

				if (!document) {
					return { ok: false, message: "Documento no encontrado" }
				}

				if (document.status !== ReviewStatus.NOT_APPLIED) {
					return {
						ok: false,
						message: "Solo se puede revertir documentos en estado 'No Aplica'",
					}
				}

				await prisma.environmentalDocument.delete({ where: { id: document.id } })
				deletedDocument = { id: document.id, name: document.name, type: document.type }
				break
			}

			case DocumentCategory.ENVIRONMENT: {
				const folder = await prisma.environmentFolder.findUnique({
					where: { startupFolderId: folderId },
					select: { id: true },
				})

				if (!folder) {
					return { ok: false, message: "Subcarpeta no encontrada" }
				}

				const document = await prisma.environmentDocument.findFirst({
					where: { id: documentId, folderId: folder.id },
					select: { id: true, name: true, type: true, status: true },
				})

				if (!document) {
					return { ok: false, message: "Documento no encontrado" }
				}

				if (document.status !== ReviewStatus.NOT_APPLIED) {
					return {
						ok: false,
						message: "Solo se puede revertir documentos en estado 'No Aplica'",
					}
				}

				await prisma.environmentDocument.delete({ where: { id: document.id } })
				deletedDocument = { id: document.id, name: document.name, type: document.type }
				break
			}

			case DocumentCategory.TECHNICAL_SPECS: {
				const folder = await prisma.techSpecsFolder.findUnique({
					where: { startupFolderId: folderId },
					select: { id: true },
				})

				if (!folder) {
					return { ok: false, message: "Subcarpeta no encontrada" }
				}

				const document = await prisma.techSpecsDocument.findFirst({
					where: { id: documentId, folderId: folder.id },
					select: { id: true, name: true, type: true, status: true },
				})

				if (!document) {
					return { ok: false, message: "Documento no encontrado" }
				}

				if (document.status !== ReviewStatus.NOT_APPLIED) {
					return {
						ok: false,
						message: "Solo se puede revertir documentos en estado 'No Aplica'",
					}
				}

				await prisma.techSpecsDocument.delete({ where: { id: document.id } })
				deletedDocument = { id: document.id, name: document.name, type: document.type }
				break
			}

			case DocumentCategory.PERSONNEL: {
				if (!workerId) {
					return { ok: false, message: "ID de trabajador requerido" }
				}

				const folder = await prisma.workerFolder.findUnique({
					where: { workerId_startupFolderId: { workerId, startupFolderId: folderId } },
					select: { id: true },
				})

				if (!folder) {
					return { ok: false, message: "Subcarpeta de trabajador no encontrada" }
				}

				const document = await prisma.workerDocument.findFirst({
					where: { id: documentId, folderId: folder.id },
					select: { id: true, name: true, type: true, status: true },
				})

				if (!document) {
					return { ok: false, message: "Documento no encontrado" }
				}

				if (document.status !== ReviewStatus.NOT_APPLIED) {
					return {
						ok: false,
						message: "Solo se puede revertir documentos en estado 'No Aplica'",
					}
				}

				await prisma.workerDocument.delete({ where: { id: document.id } })
				deletedDocument = { id: document.id, name: document.name, type: document.type }
				break
			}

			case DocumentCategory.VEHICLES: {
				if (!vehicleId) {
					return { ok: false, message: "ID de vehículo requerido" }
				}

				const folder = await prisma.vehicleFolder.findUnique({
					where: { vehicleId_startupFolderId: { vehicleId, startupFolderId: folderId } },
					select: { id: true },
				})

				if (!folder) {
					return { ok: false, message: "Subcarpeta de vehículo no encontrada" }
				}

				const document = await prisma.vehicleDocument.findFirst({
					where: { id: documentId, folderId: folder.id },
					select: { id: true, name: true, type: true, status: true },
				})

				if (!document) {
					return { ok: false, message: "Documento no encontrado" }
				}

				if (document.status !== ReviewStatus.NOT_APPLIED) {
					return {
						ok: false,
						message: "Solo se puede revertir documentos en estado 'No Aplica'",
					}
				}

				await prisma.vehicleDocument.delete({ where: { id: document.id } })
				deletedDocument = { id: document.id, name: document.name, type: document.type }
				break
			}

			case DocumentCategory.BASIC: {
				if (!workerId) {
					return { ok: false, message: "ID de trabajador requerido" }
				}

				const folder = await prisma.basicFolder.findUnique({
					where: { workerId_startupFolderId: { workerId, startupFolderId: folderId } },
					select: { id: true },
				})

				if (!folder) {
					return { ok: false, message: "Subcarpeta básica no encontrada" }
				}

				const document = await prisma.basicDocument.findFirst({
					where: { id: documentId, folderId: folder.id },
					select: { id: true, name: true, type: true, status: true },
				})

				if (!document) {
					return { ok: false, message: "Documento no encontrado" }
				}

				if (document.status !== ReviewStatus.NOT_APPLIED) {
					return {
						ok: false,
						message: "Solo se puede revertir documentos en estado 'No Aplica'",
					}
				}

				await prisma.basicDocument.delete({ where: { id: document.id } })
				deletedDocument = { id: document.id, name: document.name, type: document.type }
				break
			}

			default:
				return { ok: false, message: `Categoría no soportada: ${category}` }
		}

		if (!deletedDocument) {
			return {
				ok: false,
				message: "Error al revertir el documento",
			}
		}

  await logActivity({
			userId,
			entityId: deletedDocument.id,
			action: ACTIVITY_TYPE.DELETE,
			module: MODULES.STARTUP_FOLDERS,
			entityType: "StartupFolderDocument",
			metadata: {
				folderId,
				category,
				workerId,
				vehicleId,
				documentName: deletedDocument.name,
				documentType: deletedDocument.type,
				status: "NOT_UPLOADED",
				action: "unmarked_not_applied",
			},
		})

		return {
			ok: true,
			message: "Documento revertido de 'No Aplica' a 'No subido' exitosamente",
		}
	} catch (error) {
		console.error("Error al revertir documento No Aplica:", error)
		return {
			ok: false,
			message: "Error al procesar la solicitud",
		}
	}
}
