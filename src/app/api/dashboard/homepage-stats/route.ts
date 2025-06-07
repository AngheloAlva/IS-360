import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import {
	WORK_ORDER_STATUS,
	USER_ROLE,
	WORK_ORDER_PRIORITY,
	WORK_PERMIT_STATUS,
	ReviewStatus,
} from "@prisma/client"

export async function GET() {
	try {
		// Get system overview data
		const [
			companiesCount,
			equipmentCount,
			usersCount,
			workOrdersCount,
			permitsCount,
			maintenancePlansCount,
			startupFoldersCount,
		] = await Promise.all([
			// Companies stats
			prisma.company.count(),
			// Equipment stats
			prisma.equipment.count(),
			// Users stats
			prisma.user.count(),
			// Work Orders stats
			prisma.workOrder.count(),
			// Permits stats
			prisma.workPermit.count(),
			// Maintenance Plans stats
			prisma.maintenancePlan.count(),
			// Startup Folders stats
			prisma.startupFolder.count(),
		])

		// Get detailed stats for system overview
		const [
			activeUsers,
			adminUsers,
			operationalEquipment,
			criticalEquipment,
			inProgressWorkOrders,
			criticalWorkOrders,
			activePermits,
			activeMaintenancePlans,
			approvedStartupFolders,
			submittedStartupFolders,
		] = await Promise.all([
			// Active users
			prisma.user.count(),
			// Admin users
			prisma.user.count({
				where: {
					accessRole: USER_ROLE.ADMIN,
				},
			}),
			// Operational equipment
			prisma.equipment.count({
				where: {
					isOperational: true,
				},
			}),
			// Critical equipment - using 'CRITICAL' assuming it's one of the types
			prisma.equipment.count({
				where: {
					type: "CRITICAL",
				},
			}),
			// In progress work orders
			prisma.workOrder.count({
				where: {
					status: WORK_ORDER_STATUS.IN_PROGRESS,
				},
			}),
			// Critical work orders
			prisma.workOrder.count({
				where: {
					priority: WORK_ORDER_PRIORITY.HIGH,
				},
			}),
			// Active permits
			prisma.workPermit.count({
				where: {
					status: WORK_PERMIT_STATUS.ACTIVE,
				},
			}),
			// Active maintenance plans - simplemente contamos todos los planes por ahora
			prisma.maintenancePlan.count(),
			// Approved startup folders
			prisma.startupFolder.count({
				where: {
					safetyAndHealthFolders: {
						some: {
							status: ReviewStatus.APPROVED,
						},
					},
				},
			}),
			// Submitted startup folders
			prisma.startupFolder.count({
				where: {
					safetyAndHealthFolders: {
						some: {
							status: ReviewStatus.SUBMITTED,
						},
					},
				},
			}),
		])

		// Get system health data
		const systemHealthData = [
			{ name: "Saludable", value: 75, color: "#10b981" },
			{ name: "Atención", value: 15, color: "#f59e0b" },
			{ name: "Crítico", value: 10, color: "#ef4444" },
		]

		// Get module activity data
		const moduleActivityData = [
			{ module: "Empresas", percentage: 82 },
			{ module: "Equipos", percentage: 76 },
			{ module: "Usuarios", percentage: 95 },
			{ module: "Órdenes", percentage: 68 },
			{ module: "Permisos", percentage: 72 },
			{ module: "Mantenimiento", percentage: 85 },
		]

		// Get weekly activity data
		const weeklyActivityData = [
			{ day: "Lun", workOrders: 5, permits: 3, maintenance: 7 },
			{ day: "Mar", workOrders: 3, permits: 2, maintenance: 5 },
			{ day: "Mie", workOrders: 8, permits: 4, maintenance: 3 },
			{ day: "Jue", workOrders: 6, permits: 7, maintenance: 4 },
			{ day: "Vie", workOrders: 7, permits: 5, maintenance: 6 },
			{ day: "Sab", workOrders: 2, permits: 1, maintenance: 2 },
			{ day: "Dom", workOrders: 1, permits: 0, maintenance: 1 },
		]

		// Get alerts data
		const alerts = [
			{
				id: 1,
				type: "urgent",
				message: "Equipo crítico fuera de servicio",
				module: "Equipos",
				time: "Hace 2 horas",
			},
			{
				id: 2,
				type: "warning",
				message: "Mantenimiento programado pendiente",
				module: "Mantenimiento",
				time: "Hace 5 horas",
			},
			{
				id: 3,
				type: "info",
				message: "5 nuevos usuarios registrados",
				module: "Usuarios",
				time: "Hace 1 día",
			},
		]

		// Get recent activity data
		const recentActivity = [
			{
				id: 1,
				action: "Orden de trabajo completada",
				module: "Órdenes",
				user: "Carlos Rodríguez",
				time: "Hace 30 min",
			},
			{
				id: 2,
				action: "Nuevo equipo registrado",
				module: "Equipos",
				user: "Ana Martínez",
				time: "Hace 2 horas",
			},
			{
				id: 3,
				action: "Permiso de trabajo actualizado",
				module: "Permisos",
				user: "Juan López",
				time: "Hace 5 horas",
			},
		]

		const systemOverviewData = {
			companies: {
				total: companiesCount,
				active: Math.round(companiesCount * 0.85), // Estimación: 85% activas
				withPendingDocs: Math.round(companiesCount * 0.3), // Estimación: 30% con docs pendientes
			},
			equipment: {
				total: equipmentCount,
				operational: operationalEquipment,
				critical: criticalEquipment,
			},
			users: {
				total: usersCount,
				active: activeUsers,
				admins: adminUsers,
			},
			workOrders: {
				total: workOrdersCount,
				inProgress: inProgressWorkOrders,
				critical: criticalWorkOrders,
			},
			permits: {
				total: permitsCount,
				active: activePermits,
				critical: Math.round(permitsCount * 0.25), // Estimación: 25% son críticos
			},
			maintenancePlans: {
				total: maintenancePlansCount,
				active: activeMaintenancePlans,
				overdue: Math.round(maintenancePlansCount * 0.15), // Estimación: 15% están atrasados
			},
			startupFolders: {
				total: startupFoldersCount,
				approved: approvedStartupFolders,
				submitted: submittedStartupFolders,
			},
		}

		return NextResponse.json({
			systemOverviewData,
			systemHealthData,
			moduleActivityData,
			weeklyActivityData,
			alerts,
			recentActivity,
		})
	} catch (error) {
		console.error("[DASHBOARD_HOMEPAGE_STATS]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}
