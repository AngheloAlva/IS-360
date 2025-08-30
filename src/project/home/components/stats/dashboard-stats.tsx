import { HomepageStatsResponse } from "@/project/home/hooks/use-homepage-stats"

import { WorkRequestsAreaChart } from "./work-request-area-chart"
import { SystemOverviewCards } from "./system-overview-cards"
import { ModuleActivityChart } from "./module-activity-chart"
import { WorkOrdersPieChart } from "./work-orders-pie-chart"

interface DashboardStatsProps {
	data?: HomepageStatsResponse
	isLoading: boolean
}

export function DashboardStats({ data, isLoading }: DashboardStatsProps) {
	return (
		<div className="space-y-6">
			<SystemOverviewCards
				data={
					data?.systemOverview || {
						companies: 0,
						equipment: 0,
						users: 0,
						workOrders: 0,
						permits: 0,
						maintenancePlans: 0,
						startupFolders: 0,
						activeUsers: 0,
						adminUsers: 0,
						operationalEquipment: 0,
						criticalEquipment: 0,
						inProgressWorkOrders: 0,
						criticalWorkOrders: 0,
						activePermits: 0,
						activeMaintenancePlans: 0,
						completedStartupFolders: 0,
						inProgressStartupFolders: 0,
						activeCompanies: 0,
						companiesWithPendingDocs: 0,
					}
				}
				isLoading={isLoading}
			/>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
				<ModuleActivityChart
					data={
						data?.moduleActivityChart || [
							{ name: "Órdenes de Trabajo", percentage: 0 },
							{ name: "Permisos de Trabajo", percentage: 0 },
							{ name: "Mantenimiento", percentage: 0 },
							{ name: "Equipos", percentage: 0 },
							{ name: "Usuarios", percentage: 0 },
						]
					}
					isLoading={isLoading}
				/>

				<WorkOrdersPieChart data={data?.workOrdersPieChart || []} isLoading={isLoading} />
			</div>

			<WorkRequestsAreaChart data={data?.workRequestsAreaChart || []} isLoading={isLoading} />
		</div>
	)
}
