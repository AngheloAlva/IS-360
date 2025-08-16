import { NextRequest, NextResponse } from "next/server"
import { WORK_ORDER_STATUS } from "@prisma/client"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

export async function GET(req: NextRequest): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const searchParams = req.nextUrl.searchParams
		const otStatus = searchParams.get("otStatus")
		const search = searchParams.get("search") || ""
		const order = searchParams.get("order") as Order
		const orderBy = searchParams.get("orderBy") as OrderBy
		const withOtActive = searchParams.get("withOtActive") === "true"
		const onlyWithReviewRequest = searchParams.get("onlyWithReviewRequest") === "true"

		const companiesWithStartupFolders = await prisma.company.findMany({
			where: {
				isActive: true,
				...(search
					? {
							OR: [
								{ name: { contains: search, mode: "insensitive" as const } },
								{ rut: { contains: search, mode: "insensitive" as const } },
								{
									StartupFolders: {
										some: { name: { contains: search, mode: "insensitive" as const } },
									},
								},
							],
						}
					: {}),
				...(withOtActive
					? {
							workOrders: {
								some: {
									status: {
										in: [
											WORK_ORDER_STATUS.PLANNED,
											WORK_ORDER_STATUS.IN_PROGRESS,
											WORK_ORDER_STATUS.PENDING,
										],
									},
								},
							},
						}
					: {}),
				...(otStatus
					? {
							workOrders: {
								some: {
									status: otStatus as WORK_ORDER_STATUS,
								},
							},
						}
					: {}),
				...(onlyWithReviewRequest
					? {
							StartupFolders: {
								some: {
									OR: [
										{
											safetyAndHealthFolders: {
												some: {
													status: "SUBMITTED",
												},
											},
										},
										{
											environmentalFolders: {
												some: {
													status: "SUBMITTED",
												},
											},
										},
										{
											environmentFolders: {
												some: {
													status: "SUBMITTED",
												},
											},
										},
										{
											techSpecsFolders: {
												some: {
													status: "SUBMITTED",
												},
											},
										},
										{
											basicFolders: {
												some: {
													status: "SUBMITTED",
												},
											},
										},
										{
											workersFolders: {
												some: {
													status: "SUBMITTED",
												},
											},
										},
										{
											vehiclesFolders: {
												some: {
													status: "SUBMITTED",
												},
											},
										},
									],
								},
							},
						}
					: {}),
			},
			select: {
				id: true,
				name: true,
				rut: true,
				image: true,
				isActive: true,
				createdAt: true,
				updatedAt: true,
				StartupFolders: {
					select: {
						id: true,
						name: true,
						status: true,
						createdAt: true,
						updatedAt: true,
						type: true,
						moreMonthDuration: true,

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
							orderBy: {
								createdAt: "asc",
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
							orderBy: {
								createdAt: "asc",
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
						workersFolders: {
							select: {
								id: true,
								status: true,
								isDriver: true,
								createdAt: true,
								updatedAt: true,
								workerId: true,
								worker: {
									select: {
										id: true,
										name: true,
										email: true,
									},
								},
								_count: {
									select: {
										documents: true,
									},
								},
							},
							orderBy: {
								worker: {
									name: "asc",
								},
							},
						},
						vehiclesFolders: {
							select: {
								id: true,
								status: true,
								createdAt: true,
								updatedAt: true,
								vehicleId: true,
								vehicle: {
									select: {
										id: true,
										plate: true,
										brand: true,
										model: true,
										year: true,
										isActive: true,
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
				},
			},
			orderBy: {
				[orderBy]: order,
			},
		})

		if (!companiesWithStartupFolders || companiesWithStartupFolders.length === 0) {
			return NextResponse.json([])
		}

		const allStartupFolderIds = companiesWithStartupFolders
			.flatMap((company) => company.StartupFolders)
			.map((folder) => folder.id)

		if (allStartupFolderIds.length === 0) {
			return NextResponse.json(companiesWithStartupFolders)
		}

		const [
			basicDocStats,
			safetyDocStats,
			environmentalDocStats,
			environmentDocStats,
			techSpecsDocStats,
			workerDocStats,
			vehicleDocStats,
		] = await Promise.all([
			prisma.basicDocument.groupBy({
				by: ["status", "folderId"],
				where: {
					folder: {
						startupFolderId: { in: allStartupFolderIds },
					},
				},
				_count: { id: true },
			}),

			prisma.safetyAndHealthDocument.groupBy({
				by: ["status", "folderId"],
				where: {
					folder: {
						startupFolderId: { in: allStartupFolderIds },
					},
				},
				_count: { id: true },
			}),

			prisma.environmentalDocument.groupBy({
				by: ["status", "folderId"],
				where: {
					folder: {
						startupFolderId: { in: allStartupFolderIds },
					},
				},
				_count: { id: true },
			}),

			prisma.environmentDocument.groupBy({
				by: ["status", "folderId"],
				where: {
					folder: {
						startupFolderId: { in: allStartupFolderIds },
					},
				},
				_count: { id: true },
			}),

			prisma.techSpecsDocument.groupBy({
				by: ["status", "folderId"],
				where: {
					folder: {
						startupFolderId: { in: allStartupFolderIds },
					},
				},
				_count: { id: true },
			}),

			prisma.workerDocument.groupBy({
				by: ["status", "folderId"],
				where: {
					folder: {
						startupFolderId: { in: allStartupFolderIds },
					},
				},
				_count: { id: true },
			}),

			prisma.vehicleDocument.groupBy({
				by: ["status", "folderId"],
				where: {
					folder: {
						startupFolderId: { in: allStartupFolderIds },
					},
				},
				_count: { id: true },
			}),
		])

		const getStatusCountByFolder = (
			stats: { status: string; folderId: string; _count: { id: number } }[],
			status: string,
			folderId: string
		) => {
			return stats.find((s) => s.status === status && s.folderId === folderId)?._count?.id || 0
		}

		const isFolderCompleted = (folderStatus: string, approvedCount: number, totalCount: number) => {
			if (folderStatus === "APPROVED") return true
			if (folderStatus === "DRAFT" || folderStatus === "SUBMITTED" || folderStatus === "REJECTED")
				return false

			return approvedCount >= totalCount && totalCount > 0
		}

		const processedCompanies = companiesWithStartupFolders.map((company) => {
			const processedStartupFolders = company.StartupFolders.map((folder) => {
				const processFolderWithStats = (
					folders: {
						id: string
						_count: { documents: number }
						status: string
						[key: string]: unknown
					}[],
					docStats: { status: string; folderId: string; _count: { id: number } }[]
				) => {
					return folders.map((subFolder) => {
						const totalDocuments = subFolder._count.documents

						const approvedDocuments = getStatusCountByFolder(docStats, "APPROVED", subFolder.id)
						const rejectedDocuments = getStatusCountByFolder(docStats, "REJECTED", subFolder.id)
						const submittedDocuments = getStatusCountByFolder(docStats, "SUBMITTED", subFolder.id)
						const draftDocuments = getStatusCountByFolder(docStats, "DRAFT", subFolder.id)

						const isCompleted = isFolderCompleted(
							subFolder.status,
							approvedDocuments,
							totalDocuments
						)

						return {
							...subFolder,

							totalDocuments,
							approvedDocuments,
							rejectedDocuments,
							submittedDocuments,
							draftDocuments,
							isCompleted,

							_count: undefined,
						}
					})
				}

				const processedBasicFolders = processFolderWithStats(folder.basicFolders, basicDocStats)
				const processedSafetyAndHealthFolders = processFolderWithStats(
					folder.safetyAndHealthFolders,
					safetyDocStats
				)
				const processedEnvironmentalFolders = processFolderWithStats(
					folder.environmentalFolders,
					environmentalDocStats
				)
				const processedEnvironmentFolders = processFolderWithStats(
					folder.environmentFolders,
					environmentDocStats
				)
				const processedTechSpecsFolders = processFolderWithStats(
					folder.techSpecsFolders,
					techSpecsDocStats
				)

				const processedWorkersFolders = folder.workersFolders.map((workerFolder) => {
					const totalDocuments = workerFolder._count.documents
					const approvedDocuments = getStatusCountByFolder(
						workerDocStats,
						"APPROVED",
						workerFolder.id
					)
					const rejectedDocuments = getStatusCountByFolder(
						workerDocStats,
						"REJECTED",
						workerFolder.id
					)
					const submittedDocuments = getStatusCountByFolder(
						workerDocStats,
						"SUBMITTED",
						workerFolder.id
					)
					const draftDocuments = getStatusCountByFolder(workerDocStats, "DRAFT", workerFolder.id)
					const isCompleted = isFolderCompleted(
						workerFolder.status,
						approvedDocuments,
						totalDocuments
					)

					return {
						...workerFolder,

						isDriver: workerFolder.isDriver,
						worker: workerFolder.worker,

						totalDocuments,
						approvedDocuments,
						rejectedDocuments,
						submittedDocuments,
						draftDocuments,
						isCompleted,
						_count: undefined,
					}
				})

				const processedVehiclesFolders = folder.vehiclesFolders.map((vehicleFolder) => {
					const totalDocuments = vehicleFolder._count.documents
					const approvedDocuments = getStatusCountByFolder(
						vehicleDocStats,
						"APPROVED",
						vehicleFolder.id
					)
					const rejectedDocuments = getStatusCountByFolder(
						vehicleDocStats,
						"REJECTED",
						vehicleFolder.id
					)
					const submittedDocuments = getStatusCountByFolder(
						vehicleDocStats,
						"SUBMITTED",
						vehicleFolder.id
					)
					const draftDocuments = getStatusCountByFolder(vehicleDocStats, "DRAFT", vehicleFolder.id)
					const isCompleted = isFolderCompleted(
						vehicleFolder.status,
						approvedDocuments,
						totalDocuments
					)

					return {
						...vehicleFolder,

						vehicle: vehicleFolder.vehicle,

						totalDocuments,
						approvedDocuments,
						rejectedDocuments,
						submittedDocuments,
						draftDocuments,
						isCompleted,
						_count: undefined,
					}
				})

				return {
					...folder,
					basicFolders: processedBasicFolders,
					safetyAndHealthFolders: processedSafetyAndHealthFolders,
					environmentalFolders: processedEnvironmentalFolders,
					environmentFolders: processedEnvironmentFolders,
					techSpecsFolders: processedTechSpecsFolders,
					workersFolders: processedWorkersFolders,
					vehiclesFolders: processedVehiclesFolders,
				}
			})

			return {
				...company,
				StartupFolders: processedStartupFolders,
			}
		})

		return NextResponse.json(processedCompanies)
	} catch (error) {
		console.error("[GENERAL_STARTUP_FOLDER_GET]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
