import { HomepageStatsResponse } from "@/project/home/hooks/use-homepage-stats"

import { SystemOverviewCards } from "./system-overview-cards"
import { ModuleActivityChart } from "./module-activity-chart"
import { WeeklyActivityChart } from "./weekly-activity-chart"
import { RecentActivity } from "./recent-activity"

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
				<WeeklyActivityChart
					data={
						data?.weeklyActivityChart || [
							{
								day: "Lunes",
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
							},
							{
								day: "Martes",
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
							},
							{
								day: "Miércoles",
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
							},
							{
								day: "Jueves",
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
							},
							{
								day: "Viernes",
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
							},
							{
								day: "Sábado",
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
							},
							{
								day: "Domingo",
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
							},
						]
					}
					isLoading={isLoading}
				/>
			</div>

			{/* Recent Activity */}
			<div className="grid gap-4 md:grid-cols-1">
				<RecentActivity activities={data?.recentActivity || []} isLoading={isLoading} />
			</div>
		</div>
	)
}
