import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { getAllowedCompanyIds } from "@/shared/actions/users/get-allowed-companies"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const userAllowedCompanies = await getAllowedCompanyIds(session.user.id)

		const [totalFolders, totalFoldersToReview, totalFoldersActive, totalCompaniesApproved] =
			await Promise.all([
				prisma.startupFolder.count({
					...(userAllowedCompanies?.length
						? {
								where: {
									companyId: {
										in: userAllowedCompanies,
									},
								},
							}
						: {}),
				}),
				prisma.startupFolder.count({
					where: {
						...(userAllowedCompanies?.length
							? {
									companyId: {
										in: userAllowedCompanies,
									},
								}
							: {}),
						OR: [
							{ basicFolders: { some: { status: "SUBMITTED" } } },
							{ workersFolders: { some: { status: "SUBMITTED" } } },
							{ vehiclesFolders: { some: { status: "SUBMITTED" } } },
							{ environmentalFolders: { some: { status: "SUBMITTED" } } },
							{ environmentFolders: { some: { status: "SUBMITTED" } } },
							{ techSpecsFolders: { some: { status: "SUBMITTED" } } },
							{ safetyAndHealthFolders: { some: { status: "SUBMITTED" } } },
						],
					},
				}),
				prisma.startupFolder.count({
					where: {
						...(userAllowedCompanies?.length
							? {
									companyId: {
										in: userAllowedCompanies,
									},
								}
							: {}),
						company: {
							workOrders: {
								some: {
									status: { in: ["IN_PROGRESS", "PENDING", "PLANNED"] },
								},
							},
						},
					},
				}),
				prisma.company.count({
					where: {
						...(userAllowedCompanies?.length
							? {
									id: {
										in: userAllowedCompanies,
									},
								}
							: {}),
						StartupFolders: {
							some: {
								AND: [
									{ environmentalFolders: { every: { status: "APPROVED" } } },
									{ environmentFolders: { every: { status: "APPROVED" } } },
									{ techSpecsFolders: { every: { status: "APPROVED" } } },
									{ safetyAndHealthFolders: { every: { status: "APPROVED" } } },
									{ vehiclesFolders: { every: { status: "APPROVED" } } },
									{ workersFolders: { every: { status: "APPROVED" } } },
									{ basicFolders: { every: { status: "APPROVED" } } },
								],
							},
						},
					},
				}),
			])

		// Obtener datos de documentos para el gráfico de estado general
		const [
			safetyDocs,
			environmentalDocs,
			workerDocs,
			vehicleDocs,
			environmentDocs,
			techSpecsDocs,
			basicDocs,
		] = await Promise.all([
			prisma.safetyAndHealthDocument.groupBy({
				by: ["status"],
				_count: { id: true },
			}),
			prisma.environmentalDocument.groupBy({
				by: ["status"],
				_count: { id: true },
			}),
			prisma.workerDocument.groupBy({
				by: ["status"],
				_count: { id: true },
			}),
			prisma.vehicleDocument.groupBy({
				by: ["status"],
				_count: { id: true },
			}),
			prisma.environmentDocument.groupBy({
				by: ["status"],
				_count: { id: true },
			}),
			prisma.techSpecsDocument.groupBy({
				by: ["status"],
				_count: { id: true },
			}),
			prisma.basicDocument.groupBy({
				by: ["status"],
				_count: { id: true },
			}),
		])

		const documentsByStatus = [
			"DRAFT",
			"SUBMITTED",
			"APPROVED",
			"REJECTED",
			"EXPIRED",
			"TO_UPDATE",
		].map((status) => {
			const safetyCount = safetyDocs.find((d) => d.status === status)?._count.id ?? 0
			const environmentalCount = environmentalDocs.find((d) => d.status === status)?._count.id ?? 0
			const workerCount = workerDocs.find((d) => d.status === status)?._count.id ?? 0
			const vehicleCount = vehicleDocs.find((d) => d.status === status)?._count.id ?? 0
			const basicCount = basicDocs.find((d) => d.status === status)?._count.id ?? 0
			const environmentCount = environmentDocs.find((d) => d.status === status)?._count.id ?? 0
			const techSpecsCount = techSpecsDocs.find((d) => d.status === status)?._count.id ?? 0

			return {
				status,
				count:
					safetyCount +
					environmentalCount +
					workerCount +
					vehicleCount +
					basicCount +
					environmentCount +
					techSpecsCount,
			}
		})

		// Obtener datos de subcarpetas para el gráfico de barras
		const [
			safetyFolders,
			environmentalFolders,
			workerFolders,
			vehicleFolders,
			environmentFolders,
			techSpecsFolders,
			basicFolders,
		] = await Promise.all([
			prisma.safetyAndHealthFolder.groupBy({
				by: ["status"],
				_count: { id: true },
			}),
			prisma.environmentalFolder.groupBy({
				by: ["status"],
				_count: { id: true },
			}),
			prisma.workerFolder.groupBy({
				by: ["status"],
				_count: { id: true },
			}),
			prisma.vehicleFolder.groupBy({
				by: ["status"],
				_count: { id: true },
			}),
			prisma.environmentFolder.groupBy({
				by: ["status"],
				_count: { id: true },
			}),
			prisma.techSpecsFolder.groupBy({
				by: ["status"],
				_count: { id: true },
			}),
			prisma.basicFolder.groupBy({
				by: ["status"],
				_count: { id: true },
			}),
		])

		// Combinar Environmental y Environment en "Medio Ambiente"
		const combinedEnvironmentStatus = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "EXPIRED"]
			.map((status) => {
				const environmentalCount =
					environmentalFolders.find((f) => f.status === status)?._count.id ?? 0
				const environmentCount = environmentFolders.find((f) => f.status === status)?._count.id ?? 0
				return {
					status,
					count: environmentalCount + environmentCount,
				}
			})
			.filter((item) => item.count > 0)

		const subfoldersByType = [
			{
				name: "Seguridad y Salud",
				DRAFT: safetyFolders.find((f) => f.status === "DRAFT")?._count.id ?? 0,
				SUBMITTED: safetyFolders.find((f) => f.status === "SUBMITTED")?._count.id ?? 0,
				APPROVED: safetyFolders.find((f) => f.status === "APPROVED")?._count.id ?? 0,
				REJECTED: safetyFolders.find((f) => f.status === "REJECTED")?._count.id ?? 0,
				EXPIRED: safetyFolders.find((f) => f.status === "EXPIRED")?._count.id ?? 0,
				TO_UPDATE: safetyFolders.find((f) => f.status === "TO_UPDATE")?._count.id ?? 0,
			},
			{
				name: "Medio Ambiente",
				DRAFT: combinedEnvironmentStatus.find((f) => f.status === "DRAFT")?.count ?? 0,
				SUBMITTED: combinedEnvironmentStatus.find((f) => f.status === "SUBMITTED")?.count ?? 0,
				APPROVED: combinedEnvironmentStatus.find((f) => f.status === "APPROVED")?.count ?? 0,
				REJECTED: combinedEnvironmentStatus.find((f) => f.status === "REJECTED")?.count ?? 0,
				EXPIRED: combinedEnvironmentStatus.find((f) => f.status === "EXPIRED")?.count ?? 0,
				TO_UPDATE: combinedEnvironmentStatus.find((f) => f.status === "TO_UPDATE")?.count ?? 0,
			},
			{
				name: "Especificaciones Técnicas",
				DRAFT: techSpecsFolders.find((f) => f.status === "DRAFT")?._count.id ?? 0,
				SUBMITTED: techSpecsFolders.find((f) => f.status === "SUBMITTED")?._count.id ?? 0,
				APPROVED: techSpecsFolders.find((f) => f.status === "APPROVED")?._count.id ?? 0,
				REJECTED: techSpecsFolders.find((f) => f.status === "REJECTED")?._count.id ?? 0,
				EXPIRED: techSpecsFolders.find((f) => f.status === "EXPIRED")?._count.id ?? 0,
				TO_UPDATE: techSpecsFolders.find((f) => f.status === "TO_UPDATE")?._count.id ?? 0,
			},
			{
				name: "Trabajadores",
				DRAFT: workerFolders.find((f) => f.status === "DRAFT")?._count.id ?? 0,
				SUBMITTED: workerFolders.find((f) => f.status === "SUBMITTED")?._count.id ?? 0,
				APPROVED: workerFolders.find((f) => f.status === "APPROVED")?._count.id ?? 0,
				REJECTED: workerFolders.find((f) => f.status === "REJECTED")?._count.id ?? 0,
				EXPIRED: workerFolders.find((f) => f.status === "EXPIRED")?._count.id ?? 0,
				TO_UPDATE: workerFolders.find((f) => f.status === "TO_UPDATE")?._count.id ?? 0,
			},
			{
				name: "Vehículos",
				DRAFT: vehicleFolders.find((f) => f.status === "DRAFT")?._count.id ?? 0,
				SUBMITTED: vehicleFolders.find((f) => f.status === "SUBMITTED")?._count.id ?? 0,
				APPROVED: vehicleFolders.find((f) => f.status === "APPROVED")?._count.id ?? 0,
				REJECTED: vehicleFolders.find((f) => f.status === "REJECTED")?._count.id ?? 0,
				EXPIRED: vehicleFolders.find((f) => f.status === "EXPIRED")?._count.id ?? 0,
				TO_UPDATE: vehicleFolders.find((f) => f.status === "TO_UPDATE")?._count.id ?? 0,
			},
			{
				name: "Básicos",
				DRAFT: basicFolders.find((f) => f.status === "DRAFT")?._count.id ?? 0,
				SUBMITTED: basicFolders.find((f) => f.status === "SUBMITTED")?._count.id ?? 0,
				APPROVED: basicFolders.find((f) => f.status === "APPROVED")?._count.id ?? 0,
				REJECTED: basicFolders.find((f) => f.status === "REJECTED")?._count.id ?? 0,
				EXPIRED: basicFolders.find((f) => f.status === "EXPIRED")?._count.id ?? 0,
				TO_UPDATE: basicFolders.find((f) => f.status === "TO_UPDATE")?._count.id ?? 0,
			},
		]

		return NextResponse.json({
			totalFolders,
			totalFoldersActive,
			totalFoldersToReview,
			totalCompaniesApproved,

			charts: {
				documentsByStatus,
				subfoldersByType,
			},
		})
	} catch (error) {
		console.error("[STARTUP_FOLDERS_STATS_ERROR]", error)
		return new NextResponse("Error interno del servidor", { status: 500 })
	}
}
