import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { BASIC_FOLDER_STRUCTURE } from "@/lib/consts/basic-startup-folders-structure"
import {
	SAFETY_AND_HEALTH_STRUCTURE,
	ENVIRONMENTAL_STRUCTURE,
	ENVIRONMENT_STRUCTURE,
	EXTENDED_ENVIRONMENT_STRUCTURE,
	TECH_SPEC_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"
import {
	BASE_WORKER_STRUCTURE,
	DRIVER_WORKER_STRUCTURE,
} from "@/lib/consts/worker-folder-structure"
import { VEHICLE_STRUCTURE } from "@/lib/consts/vehicle-folder-structure"

export async function GET(req: NextRequest): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const searchParams = req.nextUrl.searchParams
		const companyId = searchParams.get("companyId")
		const showArchived = searchParams.get("showArchived") === "true"
		const archivedOnly = searchParams.get("archivedOnly") === "true"

		if (!companyId) {
			return new NextResponse("Either company ID or folder ID is required", { status: 400 })
		}

		const startupFolders = await prisma.startupFolder.findMany({
			where: {
				companyId,
				isDeleted: false,
				...(archivedOnly ? { isArchived: true } : showArchived ? {} : { isArchived: false }),
			},
			select: {
				id: true,
				name: true,
				type: true,
				status: true,
				createdAt: true,
				updatedAt: true,
				isArchived: true,
				moreMonthDuration: true,
				company: {
					select: {
						id: true,
						rut: true,
						name: true,
						image: true,
					},
				},
				basicFolders: {
					where: {
						worker: {
							isActive: true,
						},
					},
					select: {
						id: true,
						status: true,
						createdAt: true,
						updatedAt: true,
						worker: {
							select: {
								name: true,
							},
						},
						_count: {
							select: {
								documents: true,
							},
						},
					},
				},
				safetyAndHealthFolders: {
					select: {
						id: true,
						status: true,
						createdAt: true,
						updatedAt: true,
						_count: {
							select: {
								documents: true,
							},
						},
					},
				},
				environmentalFolders: {
					select: {
						id: true,
						status: true,
						createdAt: true,
						updatedAt: true,
						_count: {
							select: {
								documents: true,
							},
						},
					},
				},
				environmentFolders: {
					select: {
						id: true,
						status: true,
						createdAt: true,
						updatedAt: true,
						_count: {
							select: {
								documents: true,
							},
						},
					},
				},
				techSpecsFolders: {
					select: {
						id: true,
						status: true,
						createdAt: true,
						updatedAt: true,
						_count: {
							select: {
								documents: true,
							},
						},
					},
				},
				workersFolders: {
					where: {
						worker: {
							isActive: true,
						},
					},
					select: {
						id: true,
						status: true,
						isDriver: true,
						createdAt: true,
						updatedAt: true,
						workerId: true,
						worker: {
							select: {
								name: true,
							},
						},
						_count: {
							select: {
								documents: true,
							},
						},
					},
				},
				vehiclesFolders: {
					where: {
						vehicle: {
							isActive: true,
						},
					},
					select: {
						id: true,
						status: true,
						createdAt: true,
						updatedAt: true,
						vehicleId: true,
						vehicle: {
							select: {
								plate: true,
							},
						},
						_count: {
							select: {
								documents: true,
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: "asc",
			},
		})

		if (!startupFolders || startupFolders.length === 0) {
			return NextResponse.json([])
		}

		// Obtiene documentos filtrados por tipos canónicos, agrupados por type + status.
		// Esto permite contar TIPOS ÚNICOS satisfechos en vez de instancias de documentos.
		const getDocumentsByTypeAndStatus = async (
			folderId: string,
			documentType: string,
			expectedTypes: string[]
		) => {
			switch (documentType) {
				case "basic":
					return await prisma.basicDocument.findMany({
						where: { folderId, type: { in: expectedTypes as never[] } },
						select: { type: true, status: true },
					})
				case "safety":
					return await prisma.safetyAndHealthDocument.findMany({
						where: { folderId, type: { in: expectedTypes as never[] } },
						select: { type: true, status: true },
					})
				case "environmental":
					return await prisma.environmentalDocument.findMany({
						where: { folderId, type: { in: expectedTypes as never[] } },
						select: { type: true, status: true },
					})
				case "environment":
					return await prisma.environmentDocument.findMany({
						where: { folderId, type: { in: expectedTypes as never[] } },
						select: { type: true, status: true },
					})
				case "techSpecs":
					return await prisma.techSpecsDocument.findMany({
						where: { folderId, type: { in: expectedTypes as never[] } },
						select: { type: true, status: true },
					})
				case "worker":
					return await prisma.workerDocument.findMany({
						where: { folderId, type: { in: expectedTypes as never[] } },
						select: { type: true, status: true },
					})
				case "vehicle":
					return await prisma.vehicleDocument.findMany({
						where: { folderId, type: { in: expectedTypes as never[] } },
						select: { type: true, status: true },
					})
				default:
					return []
			}
		}

		// Para cada tipo requerido, determina el "mejor" estado de sus documentos.
		// Prioridad: APPROVED/NOT_APPLIED > SUBMITTED > REJECTED/EXPIRED/TO_UPDATE/DRAFT > sin documento
		const computeTypeBasedCounts = (
			documents: { type: string; status: string }[],
			expectedTypes: string[]
		) => {
			const statusByType = new Map<string, string>()

			for (const doc of documents) {
				const current = statusByType.get(doc.type)

				// Si ya tiene APPROVED o NOT_APPLIED, no cambia
				if (current === "APPROVED" || current === "NOT_APPLIED") continue

				// APPROVED/NOT_APPLIED siempre gana
				if (doc.status === "APPROVED" || doc.status === "NOT_APPLIED") {
					statusByType.set(doc.type, doc.status)
					continue
				}

				// SUBMITTED tiene segunda prioridad
				if (doc.status === "SUBMITTED" && current !== "SUBMITTED") {
					statusByType.set(doc.type, doc.status)
					continue
				}

				// Cualquier otro estado se registra si no hay nada mejor
				if (!current || current === "DRAFT") {
					statusByType.set(doc.type, doc.status)
				}
			}

			let approved = 0
			let rejected = 0
			let submitted = 0
			let expired = 0
			let draft = 0

			for (const expectedType of expectedTypes) {
				const status = statusByType.get(expectedType)
				if (!status) {
					draft++ // Tipo sin documento = faltante, cuenta como draft
					continue
				}
				switch (status) {
					case "APPROVED":
					case "NOT_APPLIED":
						approved++
						break
					case "SUBMITTED":
						submitted++
						break
					case "REJECTED":
						rejected++
						break
					case "EXPIRED":
					case "TO_UPDATE":
						expired++
						break
					default:
						draft++
				}
			}

			return { approved, rejected, submitted, expired, draft, total: expectedTypes.length }
		}

		const isFolderCompleted = (
			folderStatus: string,
			approvedCount: number,
			expectedCount: number
		) => {
			if (folderStatus === "APPROVED") return true
			if (folderStatus === "DRAFT" || folderStatus === "SUBMITTED" || folderStatus === "REJECTED")
				return false

			return approvedCount >= expectedCount
		}

		// Tipos esperados extraídos de las estructuras canónicas
		const basicExpectedTypes = BASIC_FOLDER_STRUCTURE.documents.map((d) => d.type)
		const safetyExpectedTypes = SAFETY_AND_HEALTH_STRUCTURE.documents.map((d) => d.type)
		const environmentalExpectedTypes = ENVIRONMENTAL_STRUCTURE.documents.map((d) => d.type)
		const techSpecsExpectedTypes = TECH_SPEC_STRUCTURE.documents.map((d) => d.type)
		const vehicleExpectedTypes = VEHICLE_STRUCTURE.documents.map((d) => d.type)

		const processedFolders = await Promise.all(
			startupFolders.map(async (folder) => {
				const environmentExpectedTypes = folder.moreMonthDuration
					? EXTENDED_ENVIRONMENT_STRUCTURE.documents.map((d) => d.type)
					: ENVIRONMENT_STRUCTURE.documents.map((d) => d.type)

				const processFolderWithStats = async (
					folders: {
						id: string
						_count: { documents: number }
						status: string
						[key: string]: unknown
					}[],
					documentType: string,
					expectedTypes: string[]
				) => {
					return await Promise.all(
						folders.map(async (subFolder) => {
							const docs = await getDocumentsByTypeAndStatus(
								subFolder.id,
								documentType,
								expectedTypes
							)
							const counts = computeTypeBasedCounts(docs, expectedTypes)

							const isCompleted = isFolderCompleted(
								subFolder.status,
								counts.approved,
								counts.total
							)

							return {
								...subFolder,
								documentCounts: counts,
								isCompleted,
							}
						})
					)
				}

				const processedBasicFolders = await processFolderWithStats(
					folder.basicFolders,
					"basic",
					basicExpectedTypes
				)
				const processedSafetyAndHealthFolders = await processFolderWithStats(
					folder.safetyAndHealthFolders,
					"safety",
					safetyExpectedTypes
				)
				const processedEnvironmentalFolders = await processFolderWithStats(
					folder.environmentalFolders,
					"environmental",
					environmentalExpectedTypes
				)
				const processedEnvironmentFolders = await processFolderWithStats(
					folder.environmentFolders,
					"environment",
					environmentExpectedTypes
				)
				const processedTechSpecsFolders = await processFolderWithStats(
					folder.techSpecsFolders,
					"techSpecs",
					techSpecsExpectedTypes
				)

				const processedWorkersFolders = await Promise.all(
					folder.workersFolders.map(async (workerFolder) => {
						const workerExpectedTypes = workerFolder.isDriver
							? DRIVER_WORKER_STRUCTURE.documents.map((d) => d.type)
							: BASE_WORKER_STRUCTURE.documents.map((d) => d.type)

						const docs = await getDocumentsByTypeAndStatus(
							workerFolder.id,
							"worker",
							workerExpectedTypes
						)
						const counts = computeTypeBasedCounts(docs, workerExpectedTypes)

						const isCompleted = isFolderCompleted(
							workerFolder.status,
							counts.approved,
							counts.total
						)

						return {
							...workerFolder,
							isDriver: workerFolder.isDriver,
							documentCounts: counts,
							isCompleted,
						}
					})
				)

				const processedVehiclesFolders = await Promise.all(
					folder.vehiclesFolders.map(async (vehicleFolder) => {
						const docs = await getDocumentsByTypeAndStatus(
							vehicleFolder.id,
							"vehicle",
							vehicleExpectedTypes
						)
						const counts = computeTypeBasedCounts(docs, vehicleExpectedTypes)

						const isCompleted = isFolderCompleted(
							vehicleFolder.status,
							counts.approved,
							counts.total
						)

						return {
							...vehicleFolder,
							documentCounts: counts,
							isCompleted,
						}
					})
				)

				return {
					...folder,
					basicFolder: processedBasicFolders,
					safetyAndHealthFolders: processedSafetyAndHealthFolders,
					environmentalFolders: processedEnvironmentalFolders,
					environmentFolders: processedEnvironmentFolders,
					techSpecsFolders: processedTechSpecsFolders,
					workersFolders: processedWorkersFolders,
					vehiclesFolders: processedVehiclesFolders,
				}
			})
		)

		return NextResponse.json(processedFolders)
	} catch (error) {
		console.error("[GENERAL_STARTUP_FOLDER_GET]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
