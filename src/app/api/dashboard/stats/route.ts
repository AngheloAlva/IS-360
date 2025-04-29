import { NextResponse } from "next/server"

import { WORK_ORDER_STATUS } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function GET() {
	try {
		const [workOrderStats, companyStats, maintenanceStats, documentStats] = await Promise.all([
			// Estadísticas de órdenes de trabajo
			prisma.$transaction([
				prisma.workOrder.count(),
				prisma.workOrder.count({
					where: { status: WORK_ORDER_STATUS.PENDING },
				}),
				prisma.workOrder.count({
					where: { status: WORK_ORDER_STATUS.IN_PROGRESS },
				}),
				prisma.workOrder.groupBy({
					by: ["type"],
					_count: {
						_all: true,
					},
				}),
			]),

			// Estadísticas de empresas
			prisma.$transaction([
				prisma.company.count(),
				prisma.user.groupBy({
					by: ["companyId"],
					_count: {
						_all: true,
					},
				}),
			]),

			// Estadísticas de planes de mantenimiento
			prisma.$transaction([
				prisma.maintenancePlan.count(),
				prisma.maintenancePlanTask.count(),
				prisma.maintenancePlanTask.groupBy({
					by: ["frequency"],
					_count: {
						_all: true,
					},
				}),
				prisma.maintenancePlanTask.findMany({
					where: {
						nextDate: {
							lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Próximos 7 días
						},
					},
					select: {
						id: true,
						slug: true,
						name: true,
						nextDate: true,
						equipment: {
							select: {
								name: true,
							},
						},
					},
				}),
			]),

			// Estadísticas de documentos
			prisma.$transaction([
				prisma.file.count(),
				prisma.file.groupBy({
					by: ["area"],
					_count: {
						_all: true,
					},
				}),
			]),
		])

		const [totalOts, pendingOts, inProgressOts, otsByType] = workOrderStats

		const [totalCompanies, usersPerCompany] = companyStats

		const [totalMaintenancePlans, totalTasks, tasksByFrequency, upcomingTasks] = maintenanceStats

		const [totalDocuments, documentsByArea] = documentStats

		return NextResponse.json({
			workOrders: {
				total: totalOts,
				pending: pendingOts,
				inProgress: inProgressOts,
				byType: otsByType.map((item) => ({
					type: item.type,
					_count: item._count._all,
				})),
			},
			companies: {
				total: totalCompanies,
				usersDistribution: usersPerCompany.map((item) => ({
					companyId: item.companyId,
					_count: item._count._all,
				})),
			},
			maintenance: {
				totalPlans: totalMaintenancePlans,
				totalTasks,
				tasksByFrequency: tasksByFrequency.map((item) => ({
					frequency: item.frequency,
					_count: item._count._all,
				})),
				upcomingTasks,
			},
			documents: {
				total: totalDocuments,
				byArea: documentsByArea.map((item) => ({
					area: item.area,
					_count: item._count._all,
				})),
			},
		})
	} catch (error) {
		console.error("[DASHBOARD_STATS]", error)
		return new NextResponse("Error interno del servidor", { status: 500 })
	}
}
