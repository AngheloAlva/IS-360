import { subDays, formatDistance } from "date-fns"
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { es } from "date-fns/locale"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import {
	WORK_ORDER_STATUS,
	ACCESS_ROLE,
	WORK_ORDER_PRIORITY,
	WORK_PERMIT_STATUS,
	StartupFolderStatus,
	MODULES,
	ACTIVITY_TYPE,
} from "@prisma/client"
import { ModulesLabels } from "@/lib/consts/modules"

export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const oneWeekAgo = subDays(new Date(), 7)

		// Get activity logs for recent activities and module stats
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
			activeCompanies,
			companiesWithPendingDocs,
		] = await Promise.all([
			// Active users
			prisma.user.count({
				where: {
					isActive: true,
				},
			}),
			// Admin users
			prisma.user.count({
				where: {
					accessRole: ACCESS_ROLE.ADMIN,
				},
			}),
			// Operational equipment
			prisma.equipment.count({
				where: {
					isOperational: true,
				},
			}),
			// Critical equipment
			prisma.equipment.count({
				where: {
					criticality: "CRITICAL",
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
			// Active maintenance plans - contamos todos por ahora, ya que no existe el campo isActive
			prisma.maintenancePlan.count(),
			// Completed startup folders (equivalente a aprobados)
			prisma.startupFolder.count({
				where: {
					status: StartupFolderStatus.COMPLETED,
				},
			}),
			// In progress startup folders (equivalente a enviados)
			prisma.startupFolder.count({
				where: {
					status: StartupFolderStatus.IN_PROGRESS,
				},
			}),
			// Active companies
			prisma.company.count({
				where: {
					isActive: true,
				},
			}),
			// Companies with pending documents (companies with some startup folder in DRAFT status)
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

		// 1. Calcular la actividad por módulo
		const moduleActivity = activityLogs.reduce(
			(acc, log) => {
				if (!log.module) return acc

				// Normalizar el nombre del módulo para la visualización
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

				// Incrementar el contador para este módulo
				if (!acc[moduleName]) {
					acc[moduleName] = 0
				}
				acc[moduleName]++

				return acc
			},
			{} as Record<string, number>
		)

		// Convertir los conteos a porcentajes
		const totalModuleActivity = Object.values(moduleActivity).reduce((sum, count) => sum + count, 0)
		const moduleActivityChart = Object.entries(moduleActivity)
			.map(([name, count]) => ({
				name,
				percentage: Math.round((count / totalModuleActivity) * 100) || 0,
			}))
			.sort((a, b) => b.percentage - a.percentage)
			.slice(0, 5) // Mostrar solo los 5 módulos más activos

		// 2. Calcular la actividad semanal por módulo y por día
		const dayNames = ["Sábado", "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]

		// Inicializar la estructura para rastrear actividad por día y módulo
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

		// Contar actividades por día y por módulo
		activityLogs.forEach((log) => {
			const logDate = new Date(log.timestamp)
			const dayName = dayNames[logDate.getDay()]
			const moduleType = log.module as string

			// Asignar la actividad al módulo correspondiente
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

		// Reorganizar para que comience en lunes y mantener el formato esperado
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

		const ActionLabels = {
			[ACTIVITY_TYPE.CREATE]: "creó",
			[ACTIVITY_TYPE.UPDATE]: "actualizó",
			[ACTIVITY_TYPE.DELETE]: "eliminó",
			[ACTIVITY_TYPE.APPROVE]: "aprobó",
			[ACTIVITY_TYPE.SUBMIT]: "envió",
			[ACTIVITY_TYPE.REJECT]: "rechazó",
			[ACTIVITY_TYPE.ASSIGN]: "asignó",
			[ACTIVITY_TYPE.LOGIN]: "ingresó",
			[ACTIVITY_TYPE.LOGOUT]: "salió",
			[ACTIVITY_TYPE.UPLOAD]: "subió",
		}

		// 3. Preparar la actividad reciente
		const recentActivity = activityLogs
			.slice(0, 10) // Mostrar solo las 10 actividades más recientes
			.map((log) => {
				const userName = log.user?.name || "Usuario desconocido"

				const description = `${userName} ${ActionLabels[log.action as keyof typeof ActionLabels]} en ${ModulesLabels[log.module]}`

				// Formatear el timestamp
				const timeAgo = formatDistance(new Date(log.timestamp), new Date(), {
					addSuffix: true,
					locale: es,
				})

				return {
					id: log.id,
					description,
					module: log.module,
					time: timeAgo,
					user: userName,
				}
			})

		// 4. Crear métricas para la salud del sistema basadas en datos reales
		const operationalPercentage =
			equipmentCount > 0 ? Math.round((operationalEquipment / equipmentCount) * 100) : 0
		const activeUsersPercentage = usersCount > 0 ? Math.round((activeUsers / usersCount) * 100) : 0
		const completedFoldersPercentage =
			startupFoldersCount > 0 ? Math.round((approvedStartupFolders / startupFoldersCount) * 100) : 0

		// Crear datos para el gráfico de salud del sistema (ShapeChart)
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
			recentActivity,
		})
	} catch (error) {
		console.error("[DASHBOARD_HOMEPAGE_STATS]", error)
		return new NextResponse("Internal error", { status: 500 })
	}
}
