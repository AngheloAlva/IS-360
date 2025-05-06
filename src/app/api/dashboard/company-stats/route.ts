import { NextRequest, NextResponse } from "next/server"

import { WORK_ORDER_STATUS, USER_ROLE } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams
		const companyId = searchParams.get("companyId")

		if (!companyId) {
			return new NextResponse("ID de empresa requerido", { status: 400 })
		}

		// Obtener estadísticas relacionadas con la empresa
		const [
			totalCompanyWorkOrders,
			plannedCompanyWorkOrders,
			inProgressCompanyWorkOrders,
			completedCompanyWorkOrders,
			completedTalks,
		] = await Promise.all([
			// Total de OTs asignadas a la empresa
			prisma.workOrder.count({
				where: {
					companyId: companyId,
				},
			}),

			// OTs planeadas de la empresa
			prisma.workOrder.count({
				where: {
					companyId: companyId,
					status: WORK_ORDER_STATUS.PLANNED,
				},
			}),

			// OTs en progreso de la empresa
			prisma.workOrder.count({
				where: {
					companyId: companyId,
					status: WORK_ORDER_STATUS.IN_PROGRESS,
				},
			}),

			// OTs completadas de la empresa
			prisma.workOrder.count({
				where: {
					companyId: companyId,
					status: WORK_ORDER_STATUS.COMPLETED,
				},
			}),

			// Total de usuarios de la empresa con rol externo
			prisma.user.count({
				where: {
					companyId: companyId,
					role: USER_ROLE.PARTNER_COMPANY,
				},
			}),
		])

		// Obtener las OTs próximas asignadas a la empresa (próximos 7 días)
		const upcomingCompanyWorkOrders = await prisma.workOrder.findMany({
			where: {
				companyId: companyId,
				programDate: {
					gte: new Date(),
					lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Próximos 7 días
				},
			},
			select: {
				id: true,
				otNumber: true,
				workName: true,
				workDescription: true,
				programDate: true,
				status: true,
				type: true,
				workLocation: true,
			},
			orderBy: {
				programDate: "asc",
			},
			take: 5,
		})

		return NextResponse.json({
			workOrders: {
				total: totalCompanyWorkOrders,
				planned: plannedCompanyWorkOrders,
				inProgress: inProgressCompanyWorkOrders,
				completed: completedCompanyWorkOrders,
				upcoming: upcomingCompanyWorkOrders,
			},
			users: {
				total: completedTalks,
			},
		})
	} catch (error) {
		console.error("[COMPANY_DASHBOARD_STATS]", error)
		return new NextResponse("Error interno del servidor", { status: 500 })
	}
}
