import { NextResponse } from "next/server"
import { subDays } from "date-fns"

import prisma from "@/lib/prisma"

export async function GET() {
	try {
		const companies = await prisma.company.findMany({
			select: {
				id: true,
				name: true,
				rut: true,
				image: true,
				_count: {
					select: {
						users: true,
						vehicles: true,
						workOrders: true,
						StartupFolders: true,
					},
				},
				StartupFolders: {
					select: {
						workersFolders: {
							select: {
								status: true,
								createdAt: true,
							},
						},
						vehiclesFolders: {
							select: {
								status: true,
								createdAt: true,
							},
						},
						environmentalFolders: {
							select: {
								status: true,
								createdAt: true,
							},
						},
						createdAt: true,
					},
				},
				workOrders: {
					select: {
						status: true,
						createdAt: true,
						solicitationDate: true,
						programDate: true,
					},
				},
			},
			cacheStrategy: {
				swr: 10,
				ttl: 120,
			},
		})

		const companiesData = companies.map((company) => {
			const allFolders = company.StartupFolders.flatMap((sf) => [
				...sf.workersFolders,
				...sf.vehiclesFolders,
				...sf.environmentalFolders,
			])
			const pendingDocuments = allFolders.filter(
				(folder) => folder.status === "DRAFT" || folder.status === "REJECTED"
			).length

			// Calcular tasa de cumplimiento de documentos
			const totalFolders = allFolders.length
			const approvedFolders = allFolders.filter((folder) => folder.status === "APPROVED").length
			const documentComplianceRate =
				totalFolders > 0 ? Math.round((approvedFolders / totalFolders) * 100) : 100

			// Calcular órdenes de trabajo completadas y a tiempo
			const completedWorkOrders = company.workOrders.filter(
				(wo) => wo.status === "COMPLETED"
			).length
			const onTimeWorkOrders = company.workOrders.filter(
				(wo) =>
					wo.status === "COMPLETED" &&
					wo.programDate &&
					new Date(wo.programDate) <= new Date(wo.solicitationDate)
			).length

			// Calcular porcentaje de órdenes a tiempo
			const onTimePercentage =
				completedWorkOrders > 0 ? Math.round((onTimeWorkOrders / completedWorkOrders) * 100) : 100

			// Calcular rating basado en cumplimiento y tiempo
			const rating = ((documentComplianceRate + onTimePercentage) / 2 / 100) * 5

			return {
				id: company.id,
				name: company.name,
				rut: company.rut,
				image: company.image || "/placeholder.svg?height=40&width=40",
				activeUsers: company._count.users,
				activeWorkOrders: company._count.workOrders,
				vehicles: company._count.vehicles,
				pendingDocuments,
				createdAt: company.StartupFolders[0]?.createdAt.toISOString().split("T")[0] || null,
				lastActivity:
					[...allFolders, ...company.workOrders]
						.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
						?.createdAt.toISOString()
						.split("T")[0] || null,
				rating: parseFloat(rating.toFixed(1)),
				completedProjects: completedWorkOrders,
				onTimePercentage,
				documentComplianceRate,
			}
		})

		// 1. Estado de documentos (gráfico circular general)
		const documentStatusData = [
			{
				name: "Al día",
				value: companiesData.filter((c) => c.pendingDocuments === 0).length,
				fill: "#10b981",
			},
			{
				name: "Pendiente",
				value: companiesData.filter((c) => c.pendingDocuments > 0 && c.pendingDocuments <= 2)
					.length,
				fill: "#f59e0b",
			},
		]

		// 2. Progreso de Revisión de Documentos por Empresa
		// Buscar todas las carpetas y documentos para calcular las estadísticas por empresa
		const documentProgressByCompany = await Promise.all(
			companies.map(async (company) => {
				// Buscar todos los documentos de todas las carpetas de esta empresa
				const startupFolders = await prisma.startupFolder.findMany({
					where: { companyId: company.id },
					include: {
						workersFolders: {
							include: {
								documents: { select: { status: true } },
							},
						},
						vehiclesFolders: {
							include: {
								documents: { select: { status: true } },
							},
						},
						environmentalFolders: {
							include: {
								documents: { select: { status: true } },
							},
						},
						safetyAndHealthFolders: {
							include: {
								documents: { select: { status: true } },
							},
						},
					},
				})

				// Recopilar todos los documentos de todas las carpetas
				const allDocuments = startupFolders.flatMap((folder) => [
					...folder.workersFolders.flatMap((wf) => wf.documents),
					...folder.vehiclesFolders.flatMap((vf) => vf.documents),
					...folder.environmentalFolders.flatMap((ef) => ef.documents),
					...folder.safetyAndHealthFolders.flatMap((sf) => sf.documents),
				])

				const total = allDocuments.length
				const reviewed = allDocuments.filter(
					(doc) => doc.status === "APPROVED" || doc.status === "REJECTED"
				).length
				const pending = total - reviewed

				return {
					company: company.name,
					reviewed,
					pending,
					total,
				}
			})
		)

		// Filtrar solo empresas que tengan documentos y ordenar por porcentaje pendiente descendente
		const documentReviewProgressData = documentProgressByCompany
			.filter((item) => item.total > 0)
			.sort((a, b) => b.pending / b.total - a.pending / a.total)
			.slice(0, 10) // Limitar a las 10 empresas con más pendientes

		// 3. Distribución de Órdenes de Trabajo por Estado
		// Buscar órdenes de trabajo agrupadas por empresa y estado
		const workOrdersData = await prisma.company.findMany({
			select: {
				id: true,
				name: true,
				workOrders: {
					select: {
						status: true,
					},
				},
			},
			where: {
				workOrders: {
					some: {}, // Asegura que solo se devuelvan empresas con órdenes de trabajo
				},
			},
		})

		// Procesar datos para el formato del gráfico
		const workOrderStatusData = workOrdersData
			.map((company) => {
				const planned = company.workOrders.filter((wo) => wo.status === "PLANNED").length
				const inProgress = company.workOrders.filter((wo) => wo.status === "IN_PROGRESS").length
				const completed = company.workOrders.filter((wo) => wo.status === "COMPLETED").length
				const cancelled = company.workOrders.filter((wo) => wo.status === "CANCELLED").length

				return {
					company: company.name,
					planned,
					inProgress,
					completed,
					cancelled,
				}
			})
			// Ordenar por total de órdenes de trabajo descendente
			.sort(
				(a, b) =>
					b.planned +
					b.inProgress +
					b.completed +
					b.cancelled -
					(a.planned + a.inProgress + a.completed + a.cancelled)
			)
			.slice(0, 10) // Limitar a las 10 empresas con más órdenes

		// 4. Actividad de Entrada de Trabajo (WorkEntry) por día para los últimos 30 días
		const thirtyDaysAgo = subDays(new Date(), 30)

		// Buscar todas las entradas de trabajo de los últimos 30 días
		const workEntries = await prisma.workEntry.findMany({
			select: {
				createdAt: true,
				workOrder: {
					select: {
						company: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
			where: {
				createdAt: {
					gte: thirtyDaysAgo,
				},
			},
			orderBy: {
				createdAt: "asc",
			},
		})

		// Agrupar por fecha y empresa
		const workEntryMap = new Map()

		workEntries.forEach((entry) => {
			if (!entry.workOrder?.company) return

			const date = entry.createdAt.toISOString().split("T")[0] // formato YYYY-MM-DD
			const companyId = entry.workOrder.company.id
			const companyName = entry.workOrder.company.name
			const key = `${date}-${companyId}`

			if (workEntryMap.has(key)) {
				workEntryMap.get(key).count += 1
			} else {
				workEntryMap.set(key, {
					date,
					companyId,
					companyName,
					count: 1,
				})
			}
		})

		const workEntryActivityData = Array.from(workEntryMap.values())

		// Top empresas por órdenes de trabajo activas
		const topCompaniesData = [...companiesData]
			.sort((a, b) => b.activeWorkOrders - a.activeWorkOrders)
			.slice(0, 5)
			.map((company) => ({
				name: company.name.split(" ")[0],
				workOrders: company.activeWorkOrders,
				users: company.activeUsers,
			}))

		// Calcular tendencia de registro mensual
		const currentYear = new Date().getFullYear()
		const registrationTrendData = Array.from({ length: 12 }, (_, i) => {
			const month = new Date(currentYear, i).toLocaleString("es", { month: "short" })
			const companies = companiesData.filter(
				(c) => c.createdAt && new Date(c.createdAt).getMonth() === i
			).length

			return {
				month: month.charAt(0).toUpperCase() + month.slice(1),
				companies,
			}
		})

		// Datos de cumplimiento por área
		const complianceByAreaData = [
			{ name: "Seguridad", rate: 92 },
			{ name: "Ambiental", rate: 87 },
			{ name: "Técnica", rate: 95 },
			{ name: "Laboral", rate: 89 },
			{ name: "Vehículos", rate: 78 },
		]

		return NextResponse.json({
			companiesData,
			documentStatusData,
			documentReviewProgressData,
			workOrderStatusData,
			workEntryActivityData,
			topCompaniesData,
			registrationTrendData,
			complianceByAreaData,
		})
	} catch (error) {
		console.error("Error fetching company stats:", error)
		return NextResponse.json(
			{ error: "Error al obtener estadísticas de empresas" },
			{ status: 500 }
		)
	}
}
