import { subDays, addMonths, format, startOfMonth } from "date-fns"
import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
	MODULES,
	ACCESS_ROLE,
	WORK_ORDER_STATUS,
	WORK_ORDER_PRIORITY,
	WORK_PERMIT_STATUS,
	StartupFolderStatus,
} from "@prisma/client"

export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const oneWeekAgo = subDays(new Date(), 7)

		const activityLogs = await prisma.activityLog.findMany({
			where: {
				timestamp: {
					gte: oneWeekAgo,
				},
			},
			include: {
				user: {
					select: {
						name: true,
					},
				},
			},
			orderBy: {
				timestamp: "desc",
			},
		})

		const [
			companiesCount,
			equipmentCount,
			usersCount,
			workOrdersCount,
			permitsCount,
			maintenancePlansCount,
			startupFoldersCount,
		] = await Promise.all([
			prisma.company.count(),

			prisma.equipment.count(),

			prisma.user.count(),

			prisma.workOrder.count(),

			prisma.workPermit.count(),

			prisma.maintenancePlan.count(),

			prisma.startupFolder.count(),
		])

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
			activeCompanies,
			companiesWithPendingDocs,
		] = await Promise.all([
			prisma.user.count({
				where: {
					isActive: true,
				},
			}),

			prisma.user.count({
				where: {
					accessRole: ACCESS_ROLE.ADMIN,
				},
			}),

			prisma.equipment.count({
				where: {
					isOperational: true,
				},
			}),

			prisma.equipment.count({
				where: {
					criticality: "CRITICAL",
				},
			}),

			prisma.workOrder.count({
				where: {
					status: WORK_ORDER_STATUS.IN_PROGRESS,
				},
			}),

			prisma.workOrder.count({
				where: {
					priority: WORK_ORDER_PRIORITY.HIGH,
				},
			}),

			prisma.workPermit.count({
				where: {
					status: WORK_PERMIT_STATUS.ACTIVE,
				},
			}),

			prisma.maintenancePlan.count(),

			prisma.startupFolder.count({
				where: {
					status: StartupFolderStatus.COMPLETED,
				},
			}),

			prisma.startupFolder.count({
				where: {
					status: StartupFolderStatus.IN_PROGRESS,
				},
			}),

			prisma.company.count({
				where: {
					isActive: true,
				},
			}),

			prisma.company.count({
				where: {
					StartupFolders: {
						some: {
							status: StartupFolderStatus.PENDING,
						},
					},
				},
			}),
		])

		const moduleActivity = activityLogs.reduce(
			(acc, log) => {
				if (!log.module) return acc

				let moduleName = log.module as string

				switch (moduleName) {
					case MODULES.EQUIPMENT:
						moduleName = "Equipos"
						break
					case MODULES.USERS:
						moduleName = "Usuarios"
						break
					case MODULES.WORK_ORDERS:
						moduleName = "Órdenes de trabajo"
						break
					case MODULES.WORK_PERMITS:
						moduleName = "Permisos de trabajo"
						break
					case MODULES.MAINTENANCE_PLANS:
						moduleName = "Planes de mantenimiento"
						break
					case MODULES.STARTUP_FOLDERS:
						moduleName = "Carpetas de arranque"
						break
					case MODULES.COMPANY:
						moduleName = "Empresas"
						break
					case MODULES.WORK_REQUESTS:
						moduleName = "Solicitudes de trabajo"
						break
					case MODULES.DOCUMENTATION:
						moduleName = "Documentación"
						break
					case MODULES.VEHICLES:
						moduleName = "Vehículos"
						break
						moduleName = "Órdenes de Trabajo"
						break
					case MODULES.WORK_PERMITS:
						moduleName = "Permisos"
						break
					case MODULES.COMPANY:
						moduleName = "Empresas"
						break
					case MODULES.MAINTENANCE_PLANS:
						moduleName = "Planes de Mantenimiento"
						break
					case MODULES.STARTUP_FOLDERS:
						moduleName = "Carpetas de Arranque"
						break
					case MODULES.DOCUMENTATION:
						moduleName = "Documentación"
						break
					case MODULES.VEHICLES:
						moduleName = "Vehículos"
						break
					default:
						moduleName =
							moduleName.charAt(0).toUpperCase() +
							moduleName.slice(1).toLowerCase().replace("_", " ")
				}

				if (!acc[moduleName]) {
					acc[moduleName] = 0
				}
				acc[moduleName]++

				return acc
			},
			{} as Record<string, number>
		)

		const totalModuleActivity = Object.values(moduleActivity).reduce((sum, count) => sum + count, 0)
		const moduleActivityChart = Object.entries(moduleActivity)
			.map(([name, count]) => ({
				name,
				percentage: Math.round((count / totalModuleActivity) * 100) || 0,
			}))
			.sort((a, b) => b.percentage - a.percentage)
			.slice(0, 5)

		const dayNames = ["Sábado", "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]

		type DailyModuleActivity = {
			workOrders: number
			permits: number
			maintenance: number
			equipment: number
			users: number
			companies: number
			workRequests: number
			documentation: number
			vehicles: number
			startupFolders: number
		}

		const dailyActivity: Record<string, DailyModuleActivity> = {}
		dayNames.forEach((day) => {
			dailyActivity[day] = {
				workOrders: 0,
				permits: 0,
				maintenance: 0,
				equipment: 0,
				users: 0,
				companies: 0,
				workRequests: 0,
				documentation: 0,
				vehicles: 0,
				startupFolders: 0,
			}
		})

		activityLogs.forEach((log) => {
			const logDate = new Date(log.timestamp)
			const dayName = dayNames[logDate.getDay()]
			const moduleType = log.module as string

			if (moduleType === MODULES.WORK_ORDERS) {
				dailyActivity[dayName].workOrders++
			} else if (moduleType === MODULES.WORK_PERMITS) {
				dailyActivity[dayName].permits++
			} else if (moduleType === MODULES.MAINTENANCE_PLANS) {
				dailyActivity[dayName].maintenance++
			} else if (moduleType === MODULES.EQUIPMENT) {
				dailyActivity[dayName].equipment++
			} else if (moduleType === MODULES.USERS) {
				dailyActivity[dayName].users++
			} else if (moduleType === MODULES.STARTUP_FOLDERS) {
				dailyActivity[dayName].startupFolders++
			} else if (moduleType === MODULES.COMPANY) {
				dailyActivity[dayName].companies++
			} else if (moduleType === MODULES.WORK_REQUESTS) {
				dailyActivity[dayName].workRequests++
			} else if (moduleType === MODULES.DOCUMENTATION) {
				dailyActivity[dayName].documentation++
			} else if (moduleType === MODULES.VEHICLES) {
				dailyActivity[dayName].vehicles++
			}
		})

		const weeklyActivityChart = dayNames.map((day) => ({
			day,
			workOrders: dailyActivity[day].workOrders || 0,
			permits: dailyActivity[day].permits || 0,
			maintenance: dailyActivity[day].maintenance || 0,
			equipment: dailyActivity[day].equipment || 0,
			users: dailyActivity[day].users || 0,
			companies: dailyActivity[day].companies || 0,
			workRequests: dailyActivity[day].workRequests || 0,
			documentation: dailyActivity[day].documentation || 0,
			vehicles: dailyActivity[day].vehicles || 0,
			startupFolders: dailyActivity[day].startupFolders || 0,
		}))

		const operationalPercentage =
			equipmentCount > 0 ? Math.round((operationalEquipment / equipmentCount) * 100) : 0
		const activeUsersPercentage = usersCount > 0 ? Math.round((activeUsers / usersCount) * 100) : 0
		const completedFoldersPercentage =
			startupFoldersCount > 0 ? Math.round((approvedStartupFolders / startupFoldersCount) * 100) : 0

		const systemHealthChart = [
			{
				label: "Equipos Operativos",
				value: operationalPercentage,
			},
			{
				label: "Usuarios Activos",
				value: activeUsersPercentage,
			},
			{
				label: "Carpetas Completas",
				value: completedFoldersPercentage,
			},
			{
				label: "Órdenes en Progreso",
				value: inProgressWorkOrders,
			},
			{
				label: "Permisos Activos",
				value: activePermits,
			},
		]

		const workOrdersByStatus = await prisma.workOrder.groupBy({
			by: ["status"],
			_count: {
				id: true,
			},
		})

		const workOrdersPieChart = workOrdersByStatus.map((item) => ({
			name:
				item.status === WORK_ORDER_STATUS.PLANNED
					? "Planificado"
					: item.status === WORK_ORDER_STATUS.PENDING
						? "Pendiente"
						: item.status === WORK_ORDER_STATUS.IN_PROGRESS
							? "En Progreso"
							: item.status === WORK_ORDER_STATUS.COMPLETED
								? "Completado"
								: item.status,
			value: item._count.id,
			status: item.status,
		}))

		const fiveMonthsAgo = subDays(new Date(), 150)

		const workRequestsAreaData = await prisma.workRequest.findMany({
			where: {
				requestDate: {
					gte: fiveMonthsAgo,
				},
			},
			select: {
				id: true,
				requestDate: true,
				isUrgent: true,
			},
			orderBy: {
				requestDate: "asc",
			},
		})

		const requestsByMonthAndUrgency: Record<string, { urgente: number; noUrgente: number }> = {}

		let currentMonth = subDays(startOfMonth(new Date()), 150)
		for (let i = 0; i < 5; i++) {
			const monthKey = format(currentMonth, "MMM yyyy")
			requestsByMonthAndUrgency[monthKey] = {
				urgente: 0,
				noUrgente: 0,
			}
			currentMonth = addMonths(currentMonth, 1)
		}

		workRequestsAreaData.forEach((request) => {
			const monthKey = format(startOfMonth(request.requestDate), "MMM yyyy")
			if (requestsByMonthAndUrgency[monthKey]) {
				if (request.isUrgent) {
					requestsByMonthAndUrgency[monthKey].urgente++
				} else {
					requestsByMonthAndUrgency[monthKey].noUrgente++
				}
			}
		})

		const workRequestsAreaChart = Object.entries(requestsByMonthAndUrgency).map(
			([month, urgency]) => ({
				month,
				...urgency,
			})
		)

		return NextResponse.json({
			systemOverview: {
				companies: companiesCount,
				equipment: equipmentCount,
				users: usersCount,
				workOrders: workOrdersCount,
				permits: permitsCount,
				maintenancePlans: maintenancePlansCount,
				startupFolders: startupFoldersCount,
				activeUsers,
				adminUsers,
				operationalEquipment,
				criticalEquipment,
				inProgressWorkOrders,
				criticalWorkOrders,
				activePermits,
				activeMaintenancePlans,
				completedStartupFolders: approvedStartupFolders,
				inProgressStartupFolders: submittedStartupFolders,
				activeCompanies,
				companiesWithPendingDocs,
			},
			shapeChart: systemHealthChart,
			moduleActivityChart,
			weeklyActivityChart,
			workOrdersPieChart,
			workRequestsAreaChart,
		})
	} catch (error) {
		console.error("[DASHBOARD_HOMEPAGE_STATS]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}
