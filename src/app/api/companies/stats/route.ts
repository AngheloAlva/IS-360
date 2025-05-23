import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET() {
	try {
		const [totalCompanies, companiesWithEmployees, workPermitsByStatus, recentWorkOrders] =
			await Promise.all([
				// Total companies
				prisma.company.count(),

				// Companies with their employees count
				prisma.company.findMany({
					select: {
						id: true,
						name: true,
						_count: {
							select: {
								users: true,
							},
						},
					},
					orderBy: {
						users: {
							_count: "desc",
						},
					},
					take: 5,
					cacheStrategy: {
						ttl: 120,
						swr: 10,
					},
				}),

				// Work permits by status
				prisma.workOrder.groupBy({
					by: ["status"],
					_count: true,
					cacheStrategy: {
						ttl: 120,
						swr: 10,
					},
				}),

				// Recent work orders
				prisma.workOrder.findMany({
					select: {
						id: true,
						type: true,
						status: true,
						solicitationDate: true,
						company: {
							select: {
								name: true,
							},
						},
					},
					orderBy: {
						solicitationDate: "desc",
					},
					take: 5,
					cacheStrategy: {
						ttl: 120,
						swr: 10,
					},
				}),
			])

		const companiesBySize = companiesWithEmployees.map((company) => ({
			name: company.name,
			employees: company._count.users,
		}))

		const workOrderStatus = {
			inProgress:
				workPermitsByStatus.find((status) => status.status === "IN_PROGRESS")?._count || 0,
			completed: workPermitsByStatus.find((status) => status.status === "COMPLETED")?._count || 0,
			cancelled: workPermitsByStatus.find((status) => status.status === "CANCELLED")?._count || 0,
			pending: workPermitsByStatus.find((status) => status.status === "PENDING")?._count || 0,
		}

		const formattedRecentWorkOrders = recentWorkOrders.map((order) => ({
			id: order.id,
			type: order.type,
			status: order.status,
			company: order?.company?.name || "Interno",
			date: order.solicitationDate.toLocaleDateString("es-CL"),
		}))

		return NextResponse.json({
			totalCompanies,
			companiesBySize,
			workOrderStatus,
			recentWorkOrders: formattedRecentWorkOrders,
		})
	} catch (error) {
		console.error("Error fetching company stats:", error)
		return NextResponse.json(
			{ error: "Error al obtener estadísticas de empresas" },
			{ status: 500 }
		)
	}
}
