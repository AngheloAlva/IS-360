"use server"

import {
	DocumentCategory,
	ReviewStatus,
	type SafetyAndHealthDocumentType,
	type EnvironmentalDocType,
	type EnvironmentDocType,
	type TechSpecsDocumentType,
} from "@/generated/prisma/enums"
import { BASIC_FOLDER_STRUCTURE } from "@/lib/consts/basic-startup-folders-structure"
import {
	EXTENDED_ENVIRONMENT_STRUCTURE,
	ENVIRONMENT_STRUCTURE,
	ENVIRONMENTAL_STRUCTURE,
	SAFETY_AND_HEALTH_STRUCTURE,
	TECH_SPEC_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"
import { VEHICLE_STRUCTURE } from "@/lib/consts/vehicle-folder-structure"
import {
	BASE_WORKER_STRUCTURE,
	DRIVER_WORKER_STRUCTURE,
} from "@/lib/consts/worker-folder-structure"
import prisma from "@/lib/prisma"

interface RecomputeSubfolderStatusInput {
	startupFolderId: string
	category: DocumentCategory
	workerId?: string
	vehicleId?: string
}

interface RecomputeSubfolderStatusResult {
	ok: boolean
	newStatus?: ReviewStatus
	message?: string
}

// Para cada tipo requerido, determina el "mejor" estado entre sus documentos.
// Prioridad: APPROVED/NOT_APPLIED > SUBMITTED > REJECTED/EXPIRED/TO_UPDATE/DRAFT > sin documento
function resolveStatusByType(
	documents: { type: string; status: ReviewStatus }[],
	expectedTypes: string[]
): ReviewStatus {
	const bestStatusByType = new Map<string, ReviewStatus>()

	for (const doc of documents) {
		const current = bestStatusByType.get(doc.type)

		// APPROVED/NOT_APPLIED siempre gana
		if (current === ReviewStatus.APPROVED || current === ReviewStatus.NOT_APPLIED) continue

		if (doc.status === ReviewStatus.APPROVED || doc.status === ReviewStatus.NOT_APPLIED) {
			bestStatusByType.set(doc.type, doc.status)
			continue
		}

		// SUBMITTED tiene segunda prioridad
		if (doc.status === ReviewStatus.SUBMITTED && current !== ReviewStatus.SUBMITTED) {
			bestStatusByType.set(doc.type, doc.status)
			continue
		}

		if (!current || current === ReviewStatus.DRAFT) {
			bestStatusByType.set(doc.type, doc.status)
		}
	}

	let approvedOrNotApplied = 0
	let hasSubmitted = false
	let hasRejected = false
	let hasDraft = false
	let hasExpired = false

	for (const expectedType of expectedTypes) {
		const status = bestStatusByType.get(expectedType)
		if (!status) {
			hasDraft = true // Tipo sin documento = faltante
			continue
		}
		switch (status) {
			case ReviewStatus.APPROVED:
			case ReviewStatus.NOT_APPLIED:
				approvedOrNotApplied++
				break
			case ReviewStatus.SUBMITTED:
				hasSubmitted = true
				break
			case ReviewStatus.REJECTED:
				hasRejected = true
				break
			case ReviewStatus.EXPIRED:
			case ReviewStatus.TO_UPDATE:
				hasExpired = true
				break
			default:
				hasDraft = true
		}
	}

	if (hasSubmitted) return ReviewStatus.SUBMITTED

	if (hasRejected || hasDraft || hasExpired || approvedOrNotApplied < expectedTypes.length) {
		return ReviewStatus.DRAFT
	}

	return ReviewStatus.APPROVED
}

export async function recomputeSubfolderStatus({
	startupFolderId,
	category,
	workerId,
	vehicleId,
}: RecomputeSubfolderStatusInput): Promise<RecomputeSubfolderStatusResult> {
	try {
		switch (category) {
			case DocumentCategory.SAFETY_AND_HEALTH: {
				const expectedTypes = SAFETY_AND_HEALTH_STRUCTURE.documents.map(
					(d) => d.type as SafetyAndHealthDocumentType
				)

				const folder = await prisma.safetyAndHealthFolder.findUnique({
					where: { startupFolderId },
					select: {
						id: true,
						status: true,
						documents: {
							where: { type: { in: expectedTypes } },
							select: { type: true, status: true },
						},
					},
				})

				if (!folder) {
					return { ok: false, message: "Subcarpeta no encontrada" }
				}

				const nextStatus = resolveStatusByType(folder.documents, expectedTypes)

				if (nextStatus !== folder.status) {
					await prisma.safetyAndHealthFolder.update({
						where: { startupFolderId },
						data: { status: nextStatus },
					})
				}

				return { ok: true, newStatus: nextStatus }
			}

			case DocumentCategory.ENVIRONMENTAL: {
				const expectedTypes = ENVIRONMENTAL_STRUCTURE.documents.map(
					(d) => d.type as EnvironmentalDocType
				)

				const folder = await prisma.environmentalFolder.findUnique({
					where: { startupFolderId },
					select: {
						id: true,
						status: true,
						documents: {
							where: { type: { in: expectedTypes } },
							select: { type: true, status: true },
						},
					},
				})

				if (!folder) {
					return { ok: false, message: "Subcarpeta no encontrada" }
				}

				const nextStatus = resolveStatusByType(folder.documents, expectedTypes)

				if (nextStatus !== folder.status) {
					await prisma.environmentalFolder.update({
						where: { startupFolderId },
						data: { status: nextStatus },
					})
				}

				return { ok: true, newStatus: nextStatus }
			}

			case DocumentCategory.ENVIRONMENT: {
				const startupFolder = await prisma.startupFolder.findUnique({
					where: { id: startupFolderId },
					select: { moreMonthDuration: true },
				})

				const expectedTypes = (
					startupFolder?.moreMonthDuration
						? EXTENDED_ENVIRONMENT_STRUCTURE
						: ENVIRONMENT_STRUCTURE
				).documents.map((d) => d.type as EnvironmentDocType)

				const folder = await prisma.environmentFolder.findUnique({
					where: { startupFolderId },
					select: {
						status: true,
						documents: {
							where: { type: { in: expectedTypes } },
							select: { type: true, status: true },
						},
					},
				})

				if (!folder) {
					return { ok: false, message: "Subcarpeta no encontrada" }
				}

				const nextStatus = resolveStatusByType(folder.documents, expectedTypes)

				if (nextStatus !== folder.status) {
					await prisma.environmentFolder.update({
						where: { startupFolderId },
						data: { status: nextStatus },
					})
				}

				return { ok: true, newStatus: nextStatus }
			}

			case DocumentCategory.TECHNICAL_SPECS: {
				const expectedTypes = TECH_SPEC_STRUCTURE.documents.map(
					(d) => d.type as TechSpecsDocumentType
				)

				const folder = await prisma.techSpecsFolder.findUnique({
					where: { startupFolderId },
					select: {
						status: true,
						documents: {
							where: { type: { in: expectedTypes } },
							select: { type: true, status: true },
						},
					},
				})

				if (!folder) {
					return { ok: false, message: "Subcarpeta no encontrada" }
				}

				const nextStatus = resolveStatusByType(folder.documents, expectedTypes)

				if (nextStatus !== folder.status) {
					await prisma.techSpecsFolder.update({
						where: { startupFolderId },
						data: { status: nextStatus },
					})
				}

				return { ok: true, newStatus: nextStatus }
			}

			case DocumentCategory.PERSONNEL: {
				if (!workerId) {
					return { ok: false, message: "ID de trabajador requerido" }
				}

				const folder = await prisma.workerFolder.findUnique({
					where: {
						workerId_startupFolderId: { workerId, startupFolderId },
					},
					select: {
						status: true,
						isDriver: true,
						documents: {
							select: { type: true, status: true },
						},
					},
				})

				if (!folder) {
					return { ok: false, message: "Subcarpeta no encontrada" }
				}

				const expectedTypes = (
					folder.isDriver ? DRIVER_WORKER_STRUCTURE : BASE_WORKER_STRUCTURE
				).documents.map((d) => d.type)

				const nextStatus = resolveStatusByType(folder.documents, expectedTypes)

				if (nextStatus !== folder.status) {
					await prisma.workerFolder.update({
						where: {
							workerId_startupFolderId: { workerId, startupFolderId },
						},
						data: { status: nextStatus },
					})
				}

				return { ok: true, newStatus: nextStatus }
			}

			case DocumentCategory.VEHICLES: {
				if (!vehicleId) {
					return { ok: false, message: "ID de vehículo requerido" }
				}

				const expectedTypes = VEHICLE_STRUCTURE.documents.map((d) => d.type)

				const folder = await prisma.vehicleFolder.findUnique({
					where: {
						vehicleId_startupFolderId: { vehicleId, startupFolderId },
					},
					select: {
						status: true,
						documents: {
							select: { type: true, status: true },
						},
					},
				})

				if (!folder) {
					return { ok: false, message: "Subcarpeta no encontrada" }
				}

				const nextStatus = resolveStatusByType(folder.documents, expectedTypes)

				if (nextStatus !== folder.status) {
					await prisma.vehicleFolder.update({
						where: {
							vehicleId_startupFolderId: { vehicleId, startupFolderId },
						},
						data: { status: nextStatus },
					})
				}

				return { ok: true, newStatus: nextStatus }
			}

			case DocumentCategory.BASIC: {
				if (!workerId) {
					return { ok: false, message: "ID de trabajador requerido" }
				}

				const expectedTypes = BASIC_FOLDER_STRUCTURE.documents.map((d) => d.type)

				const folder = await prisma.basicFolder.findUnique({
					where: {
						workerId_startupFolderId: { workerId, startupFolderId },
					},
					select: {
						status: true,
						documents: {
							select: { type: true, status: true },
						},
					},
				})

				if (!folder) {
					return { ok: false, message: "Subcarpeta no encontrada" }
				}

				const nextStatus = resolveStatusByType(folder.documents, expectedTypes)

				if (nextStatus !== folder.status) {
					await prisma.basicFolder.update({
						where: {
							workerId_startupFolderId: { workerId, startupFolderId },
						},
						data: { status: nextStatus },
					})
				}

				return { ok: true, newStatus: nextStatus }
			}

			default:
				return {
					ok: false,
					message: `Categoria no soportada: ${category}`,
				}
		}
	} catch (error) {
		console.error("Error recomputando estado de subcarpeta:", error)
		return {
			ok: false,
			message: "Error al recomputar estado",
		}
	}
}
