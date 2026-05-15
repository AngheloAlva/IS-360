import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { getAllowedCompanyIds } from "@/shared/actions/users/get-allowed-companies"
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
import { WORK_ORDER_STATUS } from "@/generated/prisma/enums"
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
		const userAllowedCompanies = await getAllowedCompanyIds(session.user.id)

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
				...(userAllowedCompanies?.length
					? {
							id: {
								in: userAllowedCompanies,
							},
						}
					: {}),
				...(search
					? {
							OR: [
								{ name: { contains: search, mode: "insensitive" as const } },
								{ rut: { contains: search, mode: "insensitive" as const } },
								{
									StartupFolders: {
										some: {
											name: { contains: search, mode: "insensitive" as const },
											isDeleted: false,
										},
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
									AND: {
										isDeleted: false,
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
				_count: {
					select: {
						StartupFolders: {
							where: {
								isDeleted: false,
								isArchived: true,
							},
						},
					},
				},
				StartupFolders: {
					where: {
						isDeleted: false,
						isArchived: false,
					},
					select: {
						id: true,
						name: true,
						status: true,
						createdAt: true,
						updatedAt: true,
						type: true,
						moreMonthDuration: true,
						isDeleted: true,
						isArchived: true,
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

		type DocStat = { status: string; type: string; folderId: string; _count: { id: number } }

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
				by: ["status", "type", "folderId"],
				where: {
					folder: {
						startupFolderId: { in: allStartupFolderIds },
					},
				},
				_count: { id: true },
			}),

			prisma.safetyAndHealthDocument.groupBy({
				by: ["status", "type", "folderId"],
				where: {
					folder: {
						startupFolderId: { in: allStartupFolderIds },
					},
				},
				_count: { id: true },
			}),

			prisma.environmentalDocument.groupBy({
				by: ["status", "type", "folderId"],
				where: {
					folder: {
						startupFolderId: { in: allStartupFolderIds },
					},
				},
				_count: { id: true },
			}),

			prisma.environmentDocument.groupBy({
				by: ["status", "type", "folderId"],
				where: {
					folder: {
						startupFolderId: { in: allStartupFolderIds },
					},
				},
				_count: { id: true },
			}),

			prisma.techSpecsDocument.groupBy({
				by: ["status", "type", "folderId"],
				where: {
					folder: {
						startupFolderId: { in: allStartupFolderIds },
					},
				},
				_count: { id: true },
			}),

			prisma.workerDocument.groupBy({
				by: ["status", "type", "folderId"],
				where: {
					folder: {
						startupFolderId: { in: allStartupFolderIds },
					},
				},
				_count: { id: true },
			}),

			prisma.vehicleDocument.groupBy({
				by: ["status", "type", "folderId"],
				where: {
					folder: {
						startupFolderId: { in: allStartupFolderIds },
					},
				},
				_count: { id: true },
			}),
		])

		// Misma lógica type-based que /api/startup-folders (ruta de detalle):
		// Para cada tipo esperado, determina el "mejor" estado y cuenta por categoría.
		const computeTypeBasedCounts = (
			docStats: DocStat[],
			folderId: string,
			expectedTypes: string[]
		) => {
			const folderStats = docStats.filter((s) => s.folderId === folderId)

			// Construir mapa: mejor status por tipo de documento
			const statusByType = new Map<string, string>()
			for (const stat of folderStats) {
				const current = statusByType.get(stat.type)

				if (current === "APPROVED" || current === "NOT_APPLIED") continue

				if (stat.status === "APPROVED" || stat.status === "NOT_APPLIED") {
					statusByType.set(stat.type, stat.status)
					continue
				}

				if (stat.status === "SUBMITTED" && current !== "SUBMITTED") {
					statusByType.set(stat.type, stat.status)
					continue
				}

				if (!current || current === "DRAFT") {
					statusByType.set(stat.type, stat.status)
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
					draft++
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

			return {
				totalDocuments: expectedTypes.length,
				approvedDocuments: approved,
				rejectedDocuments: rejected,
				submittedDocuments: submitted,
				expiredDocuments: expired,
				draftDocuments: draft,
			}
		}

		const isFolderCompleted = (folderStatus: string, approvedCount: number, expectedCount: number) => {
			if (folderStatus === "APPROVED") return true
			if (folderStatus === "DRAFT" || folderStatus === "SUBMITTED" || folderStatus === "REJECTED")
				return false

			return approvedCount >= expectedCount && expectedCount > 0
		}

		// Tipos esperados extraídos de las estructuras canónicas
		const basicExpectedTypes = BASIC_FOLDER_STRUCTURE.documents.map((d) => d.type)
		const safetyExpectedTypes = SAFETY_AND_HEALTH_STRUCTURE.documents.map((d) => d.type)
		const environmentalExpectedTypes = ENVIRONMENTAL_STRUCTURE.documents.map((d) => d.type)
		const techSpecsExpectedTypes = TECH_SPEC_STRUCTURE.documents.map((d) => d.type)
		const vehicleExpectedTypes = VEHICLE_STRUCTURE.documents.map((d) => d.type)

		const processedCompanies = companiesWithStartupFolders.map((company) => {
			const processedStartupFolders = company.StartupFolders.map((folder) => {
				const environmentExpectedTypes = folder.moreMonthDuration
					? EXTENDED_ENVIRONMENT_STRUCTURE.documents.map((d) => d.type)
					: ENVIRONMENT_STRUCTURE.documents.map((d) => d.type)

				const processFolderWithStats = (
					folders: {
						id: string
						_count: { documents: number }
						status: string
						[key: string]: unknown
					}[],
					docStats: DocStat[],
					expectedTypes: string[]
				) => {
					return folders.map((subFolder) => {
						const counts = computeTypeBasedCounts(docStats, subFolder.id, expectedTypes)

						const isCompleted = isFolderCompleted(
							subFolder.status,
							counts.approvedDocuments,
							counts.totalDocuments
						)

						return {
							...subFolder,
							...counts,
							isCompleted,
							_count: undefined,
						}
					})
				}

				const processedBasicFolders = processFolderWithStats(
					folder.basicFolders,
					basicDocStats,
					basicExpectedTypes
				)
				const processedSafetyAndHealthFolders = processFolderWithStats(
					folder.safetyAndHealthFolders,
					safetyDocStats,
					safetyExpectedTypes
				)
				const processedEnvironmentalFolders = processFolderWithStats(
					folder.environmentalFolders,
					environmentalDocStats,
					environmentalExpectedTypes
				)
				const processedEnvironmentFolders = processFolderWithStats(
					folder.environmentFolders,
					environmentDocStats,
					environmentExpectedTypes
				)
				const processedTechSpecsFolders = processFolderWithStats(
					folder.techSpecsFolders,
					techSpecsDocStats,
					techSpecsExpectedTypes
				)

				const processedWorkersFolders = folder.workersFolders.map((workerFolder) => {
					const workerExpectedTypes = workerFolder.isDriver
						? DRIVER_WORKER_STRUCTURE.documents.map((d) => d.type)
						: BASE_WORKER_STRUCTURE.documents.map((d) => d.type)

					const counts = computeTypeBasedCounts(
						workerDocStats,
						workerFolder.id,
						workerExpectedTypes
					)
					const isCompleted = isFolderCompleted(
						workerFolder.status,
						counts.approvedDocuments,
						counts.totalDocuments
					)

					return {
						...workerFolder,
						isDriver: workerFolder.isDriver,
						worker: workerFolder.worker,
						...counts,
						isCompleted,
						_count: undefined,
					}
				})

				const processedVehiclesFolders = folder.vehiclesFolders.map((vehicleFolder) => {
					const counts = computeTypeBasedCounts(
						vehicleDocStats,
						vehicleFolder.id,
						vehicleExpectedTypes
					)
					const isCompleted = isFolderCompleted(
						vehicleFolder.status,
						counts.approvedDocuments,
						counts.totalDocuments
					)

					return {
						...vehicleFolder,
						vehicle: vehicleFolder.vehicle,
						...counts,
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
