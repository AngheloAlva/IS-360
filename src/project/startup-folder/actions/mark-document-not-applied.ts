"use server"

import { headers } from "next/headers"

import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
	MODULES,
	ACTIVITY_TYPE,
	ReviewStatus,
	DocumentCategory,
	BasicDocumentType,
	WorkerDocumentType,
	VehicleDocumentType,
	EnvironmentDocType,
	EnvironmentalDocType,
	TechSpecsDocumentType,
	SafetyAndHealthDocumentType,
} from "@/generated/prisma/enums"
import {
	markDocumentAsNotAppliedSchema,
	type MarkDocumentAsNotAppliedInput,
} from "../schemas/mark-document-not-applied.schema"
import { recomputeSubfolderStatus } from "./recompute-subfolder-status"

export async function markStartupFolderDocumentAsNotApplied(
	input: MarkDocumentAsNotAppliedInput
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

		const { folderId, documentType, documentName, category, workerId, vehicleId } =
			markDocumentAsNotAppliedSchema.parse(input)

		const userId = session.user.id

		// Get startup folder and validate access
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

		let document: { id: string } | null = null

		switch (category as DocumentCategory) {
			case DocumentCategory.SAFETY_AND_HEALTH: {
				const folder = await prisma.safetyAndHealthFolder.findUnique({
					where: { startupFolderId: folderId },
				})
				if (!folder) {
					return { ok: false, message: "Subcarpeta no encontrada" }
				}

				const existingDocument = await prisma.safetyAndHealthDocument.findFirst({
					where: { folderId: folder.id, type: documentType as SafetyAndHealthDocumentType },
				})

				if (existingDocument) {
					return {
						ok: false,
						message:
							"Ya existe un documento de este tipo. Elimínelo primero si desea marcarlo como No Aplica.",
					}
				}

				document = await prisma.safetyAndHealthDocument.create({
					data: {
						url: "",
						folderId: folder.id,
						name: documentName,
						uploadedById: userId,
						type: documentType as SafetyAndHealthDocumentType,
						status: ReviewStatus.NOT_APPLIED,
						category: DocumentCategory.SAFETY_AND_HEALTH,
					},
				})
				break
			}

			case DocumentCategory.ENVIRONMENTAL: {
				const folder = await prisma.environmentalFolder.findUnique({
					where: { startupFolderId: folderId },
				})
				if (!folder) {
					return { ok: false, message: "Subcarpeta no encontrada" }
				}

				const existingDocument = await prisma.environmentalDocument.findFirst({
					where: { folderId: folder.id, type: documentType as EnvironmentalDocType },
				})

				if (existingDocument) {
					return {
						ok: false,
						message:
							"Ya existe un documento de este tipo. Elimínelo primero si desea marcarlo como No Aplica.",
					}
				}

				document = await prisma.environmentalDocument.create({
					data: {
						url: "",
						folderId: folder.id,
						name: documentName,
						uploadedById: userId,
						type: documentType as EnvironmentalDocType,
						status: ReviewStatus.NOT_APPLIED,
						category: DocumentCategory.ENVIRONMENTAL,
					},
				})
				break
			}

			case DocumentCategory.ENVIRONMENT: {
				const folder = await prisma.environmentFolder.findUnique({
					where: { startupFolderId: folderId },
				})
				if (!folder) {
					return { ok: false, message: "Subcarpeta no encontrada" }
				}

				const existingDocument = await prisma.environmentDocument.findFirst({
					where: { folderId: folder.id, type: documentType as EnvironmentDocType },
				})

				if (existingDocument) {
					return {
						ok: false,
						message:
							"Ya existe un documento de este tipo. Elimínelo primero si desea marcarlo como No Aplica.",
					}
				}

				document = await prisma.environmentDocument.create({
					data: {
						url: "",
						folderId: folder.id,
						name: documentName,
						uploadedById: userId,
						type: documentType as EnvironmentDocType,
						status: ReviewStatus.NOT_APPLIED,
						category: DocumentCategory.ENVIRONMENT,
					},
				})
				break
			}

			case DocumentCategory.TECHNICAL_SPECS: {
				const folder = await prisma.techSpecsFolder.findUnique({
					where: { startupFolderId: folderId },
				})
				if (!folder) {
					return { ok: false, message: "Subcarpeta no encontrada" }
				}

				const existingDocument = await prisma.techSpecsDocument.findFirst({
					where: { folderId: folder.id, type: documentType as TechSpecsDocumentType },
				})

				if (existingDocument) {
					return {
						ok: false,
						message:
							"Ya existe un documento de este tipo. Elimínelo primero si desea marcarlo como No Aplica.",
					}
				}

				document = await prisma.techSpecsDocument.create({
					data: {
						url: "",
						folderId: folder.id,
						name: documentName,
						uploadedById: userId,
						type: documentType as TechSpecsDocumentType,
						status: ReviewStatus.NOT_APPLIED,
						category: DocumentCategory.TECHNICAL_SPECS,
					},
				})
				break
			}

			case DocumentCategory.PERSONNEL: {
				if (!workerId) {
					return { ok: false, message: "ID de trabajador requerido" }
				}

				const folder = await prisma.workerFolder.findUnique({
					where: { workerId_startupFolderId: { workerId, startupFolderId: folderId } },
				})
				if (!folder) {
					return { ok: false, message: "Subcarpeta de trabajador no encontrada" }
				}

				const existingDocument = await prisma.workerDocument.findFirst({
					where: { folderId: folder.id, type: documentType as WorkerDocumentType },
				})

				if (existingDocument) {
					return {
						ok: false,
						message:
							"Ya existe un documento de este tipo. Elimínelo primero si desea marcarlo como No Aplica.",
					}
				}

				document = await prisma.workerDocument.create({
					data: {
						url: "",
						folderId: folder.id,
						name: documentName,
						uploadedById: userId,
						type: documentType as WorkerDocumentType,
						status: ReviewStatus.NOT_APPLIED,
						category: DocumentCategory.PERSONNEL,
					},
				})
				break
			}

			case DocumentCategory.VEHICLES: {
				if (!vehicleId) {
					return { ok: false, message: "ID de vehículo requerido" }
				}

				const folder = await prisma.vehicleFolder.findFirst({
					where: { vehicleId, startupFolderId: folderId },
				})
				if (!folder) {
					return { ok: false, message: "Subcarpeta de vehículo no encontrada" }
				}

				const existingDocument = await prisma.vehicleDocument.findFirst({
					where: { folderId: folder.id, type: documentType as VehicleDocumentType },
				})

				if (existingDocument) {
					return {
						ok: false,
						message:
							"Ya existe un documento de este tipo. Elimínelo primero si desea marcarlo como No Aplica.",
					}
				}

				document = await prisma.vehicleDocument.create({
					data: {
						url: "",
						folderId: folder.id,
						name: documentName,
						uploadedById: userId,
						type: documentType as VehicleDocumentType,
						status: ReviewStatus.NOT_APPLIED,
						category: DocumentCategory.VEHICLES,
					},
				})
				break
			}

			case DocumentCategory.BASIC: {
				if (!workerId) {
					return { ok: false, message: "ID de trabajador requerido" }
				}

				const folder = await prisma.basicFolder.findUnique({
					where: { workerId_startupFolderId: { workerId, startupFolderId: folderId } },
				})
				if (!folder) {
					return { ok: false, message: "Subcarpeta básica no encontrada" }
				}

				const existingDocument = await prisma.basicDocument.findFirst({
					where: { folderId: folder.id, type: documentType as BasicDocumentType },
				})

				if (existingDocument) {
					return {
						ok: false,
						message:
							"Ya existe un documento de este tipo. Elimínelo primero si desea marcarlo como No Aplica.",
					}
				}

				document = await prisma.basicDocument.create({
					data: {
						url: "",
						folderId: folder.id,
						name: documentName,
						uploadedById: userId,
						type: documentType as BasicDocumentType,
						status: ReviewStatus.NOT_APPLIED,
						category: DocumentCategory.BASIC,
					},
				})
				break
			}

			default:
				return { ok: false, message: `Categoría no soportada: ${category}` }
		}

		if (!document) {
			return {
				ok: false,
				message: "Error al crear el documento",
			}
		}

		const recomputeResult = await recomputeSubfolderStatus({
			category: category as DocumentCategory,
			workerId,
			vehicleId,
			startupFolderId: folderId,
		})

		if (!recomputeResult.ok) {
			if (category === DocumentCategory.SAFETY_AND_HEALTH) {
				await prisma.safetyAndHealthDocument.delete({ where: { id: document.id } })
			}
			if (category === DocumentCategory.ENVIRONMENTAL) {
				await prisma.environmentalDocument.delete({ where: { id: document.id } })
			}
			if (category === DocumentCategory.ENVIRONMENT) {
				await prisma.environmentDocument.delete({ where: { id: document.id } })
			}
			if (category === DocumentCategory.TECHNICAL_SPECS) {
				await prisma.techSpecsDocument.delete({ where: { id: document.id } })
			}
			if (category === DocumentCategory.PERSONNEL) {
				await prisma.workerDocument.delete({ where: { id: document.id } })
			}
			if (category === DocumentCategory.VEHICLES) {
				await prisma.vehicleDocument.delete({ where: { id: document.id } })
			}
			if (category === DocumentCategory.BASIC) {
				await prisma.basicDocument.delete({ where: { id: document.id } })
			}

			return {
				ok: false,
				message: recomputeResult.message ?? "No se pudo actualizar el estado de la subcarpeta",
			}
		}

  await logActivity({
			userId,
			entityId: document.id,
			action: ACTIVITY_TYPE.UPDATE,
			module: MODULES.STARTUP_FOLDERS,
			entityType: "StartupFolderDocument",
			metadata: {
				folderId,
				category,
				documentName,
				documentType,
				workerId,
				vehicleId,
				status: "NOT_APPLIED",
				action: "marked_as_not_applied",
			},
		})

		return {
			ok: true,
			message: "Documento marcado como 'No Aplica' exitosamente",
		}
	} catch (error) {
		console.error("Error al marcar documento como No Aplica:", error)
		return {
			ok: false,
			message: "Error al procesar la solicitud",
		}
	}
}
