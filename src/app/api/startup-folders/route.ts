import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { ACCESS_ROLE } from "@prisma/client"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	const hasAccess = session.user.accessRole === ACCESS_ROLE.ADMIN

	if (!hasAccess) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const searchParams = req.nextUrl.searchParams
		const companyId = searchParams.get("companyId")

		if (!companyId) {
			return new NextResponse("Either company ID or folder ID is required", { status: 400 })
		}

		const startupFolders = await prisma.startupFolder.findMany({
			where: {
				companyId,
			},
			select: {
				id: true,
				name: true,
				type: true,
				status: true,
				createdAt: true,
				updatedAt: true,
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
			return new NextResponse("General startup folder not found", { status: 404 })
		}

		// Función para obtener estadísticas de documentos por carpeta específica
		const getDocumentStatsByFolder = async (folderId: string, documentType: string) => {
			switch (documentType) {
				case "basic":
					return await prisma.basicDocument.groupBy({
						by: ["status"],
						where: {
							folderId: folderId,
						},
						_count: { id: true },
						orderBy: {
							status: "asc",
						},
					})
				case "safety":
					return await prisma.safetyAndHealthDocument.groupBy({
						by: ["status"],
						where: {
							folderId: folderId,
						},
						_count: { id: true },
						orderBy: {
							status: "asc",
						},
					})
				case "environmental":
					return await prisma.environmentalDocument.groupBy({
						by: ["status"],
						where: {
							folderId: folderId,
						},
						_count: { id: true },
						orderBy: {
							status: "asc",
						},
					})
				case "environment":
					return await prisma.environmentDocument.groupBy({
						by: ["status"],
						where: {
							folderId: folderId,
						},
						_count: { id: true },
						orderBy: {
							status: "asc",
						},
					})
				case "techSpecs":
					return await prisma.techSpecsDocument.groupBy({
						by: ["status"],
						where: {
							folderId: folderId,
						},
						_count: { id: true },
						orderBy: {
							status: "asc",
						},
					})
				case "worker":
					return await prisma.workerDocument.groupBy({
						by: ["status"],
						where: {
							folderId: folderId,
						},
						_count: { id: true },
						orderBy: {
							status: "asc",
						},
					})
				case "vehicle":
					return await prisma.vehicleDocument.groupBy({
						by: ["status"],
						where: {
							folderId: folderId,
						},
						_count: { id: true },
						orderBy: {
							status: "asc",
						},
					})
				default:
					return []
			}
		}

		const getStatusCount = (
			stats: { status: string; _count: { id: number } }[],
			status: string
		): number => {
			return stats.find((s) => s.status === status)?._count?.id || 0
		}

		const isFolderCompleted = (
			folderStatus: string,
			documentCount: number,
			expectedCount: number
		) => {
			if (folderStatus === "APPROVED") return true
			if (folderStatus === "DRAFT" || folderStatus === "SUBMITTED" || folderStatus === "REJECTED")
				return false

			return documentCount >= expectedCount
		}

		const processedFolders = await Promise.all(
			startupFolders.map(async (folder) => {
				const processFolderWithStats = async (
					folders: {
						id: string
						_count: { documents: number }
						status: string
						[key: string]: unknown
					}[],
					documentType: string
				) => {
					return await Promise.all(
						folders.map(async (subFolder) => {
							const totalDocuments = subFolder._count.documents
							const docStats = await getDocumentStatsByFolder(subFolder.id, documentType)

							const approvedDocuments = getStatusCount(docStats, "APPROVED")
							const rejectedDocuments = getStatusCount(docStats, "REJECTED")
							const submittedDocuments = getStatusCount(docStats, "SUBMITTED")
							const expiredDocuments = getStatusCount(docStats, "EXPIRED")
							const draftDocuments = getStatusCount(docStats, "DRAFT")

							const isCompleted = isFolderCompleted(
								subFolder.status,
								approvedDocuments,
								totalDocuments
							)

							return {
								...subFolder,
								documentCounts: {
									total: totalDocuments,
									approved: approvedDocuments,
									rejected: rejectedDocuments,
									submitted: submittedDocuments,
									expired: expiredDocuments,
									draft: draftDocuments,
								},
								isCompleted,
							}
						})
					)
				}

				const processedBasicFolders = await processFolderWithStats(folder.basicFolders, "basic")
				const processedSafetyAndHealthFolders = await processFolderWithStats(
					folder.safetyAndHealthFolders,
					"safety"
				)
				const processedEnvironmentalFolders = await processFolderWithStats(
					folder.environmentalFolders,
					"environmental"
				)
				const processedEnvironmentFolders = await processFolderWithStats(
					folder.environmentFolders,
					"environment"
				)
				const processedTechSpecsFolders = await processFolderWithStats(
					folder.techSpecsFolders,
					"techSpecs"
				)

				const processedWorkersFolders = await Promise.all(
					folder.workersFolders.map(async (workerFolder) => {
						const totalDocuments = workerFolder._count.documents
						const workerDocStats = await getDocumentStatsByFolder(workerFolder.id, "worker")

						const approvedDocuments = getStatusCount(workerDocStats, "APPROVED")
						const rejectedDocuments = getStatusCount(workerDocStats, "REJECTED")
						const submittedDocuments = getStatusCount(workerDocStats, "SUBMITTED")
						const draftDocuments = getStatusCount(workerDocStats, "DRAFT")
						const expiredDocuments = getStatusCount(workerDocStats, "EXPIRED")
						const isCompleted = isFolderCompleted(
							workerFolder.status,
							approvedDocuments,
							totalDocuments
						)

						return {
							...workerFolder,
							isDriver: workerFolder.isDriver,
							documentCounts: {
								total: totalDocuments,
								approved: approvedDocuments,
								rejected: rejectedDocuments,
								submitted: submittedDocuments,
								draft: draftDocuments,
								expired: expiredDocuments,
							},
							isCompleted,
						}
					})
				)

				const processedVehiclesFolders = await Promise.all(
					folder.vehiclesFolders.map(async (vehicleFolder) => {
						const totalDocuments = vehicleFolder._count.documents
						const vehicleDocStats = await getDocumentStatsByFolder(vehicleFolder.id, "vehicle")

						const approvedDocuments = getStatusCount(vehicleDocStats, "APPROVED")
						const rejectedDocuments = getStatusCount(vehicleDocStats, "REJECTED")
						const submittedDocuments = getStatusCount(vehicleDocStats, "SUBMITTED")
						const draftDocuments = getStatusCount(vehicleDocStats, "DRAFT")
						const expiredDocuments = getStatusCount(vehicleDocStats, "EXPIRED")
						const isCompleted = isFolderCompleted(
							vehicleFolder.status,
							approvedDocuments,
							totalDocuments
						)

						return {
							...vehicleFolder,
							documentCounts: {
								total: totalDocuments,
								approved: approvedDocuments,
								rejected: rejectedDocuments,
								submitted: submittedDocuments,
								draft: draftDocuments,
								expired: expiredDocuments,
							},
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
