import { HomepageStatsResponse } from "@/project/home/hooks/use-homepage-stats"

import { SystemOverviewCards } from "./system-overview-cards"
import { ModuleActivityChart } from "./module-activity-chart"
import { WeeklyActivityChart } from "./weekly-activity-chart"
import { SystemHealthChart } from "./system-health-chart"
import { RecentActivity } from "./recent-activity"
import { SystemAlerts } from "./system-alerts"
import { KeyMetrics } from "./key-metrics"

interface DashboardStatsProps {
	data?: HomepageStatsResponse
	isLoading: boolean
}

export function DashboardStats({ data, isLoading }: DashboardStatsProps) {
	return (
		<div className="space-y-6">
			{/* System Overview Cards */}
			<SystemOverviewCards
				data={
					data?.systemOverviewData || {
						companies: { total: 0, active: 0, withPendingDocs: 0 },
						equipment: { total: 0, operational: 0, critical: 0 },
						users: { total: 0, active: 0, admins: 0 },
						workOrders: { total: 0, inProgress: 0, critical: 0 },
						permits: { total: 0, active: 0, critical: 0 },
						maintenancePlans: { total: 0, active: 0, overdue: 0 },
						startupFolders: { total: 0, completed: 0, overdue: 0 },
					}
				}
				isLoading={isLoading}
			/>

			{/* Main Charts */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<SystemHealthChart
					data={
						data?.systemHealthData || [
							{ name: "Óptimo", value: 50, color: "#10b981" },
							{ name: "Estable", value: 30, color: "#f59e0b" },
							{ name: "Crítico", value: 20, color: "#ef4444" },
						]
					}
					isLoading={isLoading}
				/>
				<ModuleActivityChart
					data={
						data?.moduleActivityData || [
							{ module: "Equipos", percentage: 0 },
							{ module: "Usuarios", percentage: 0 },
							{ module: "Órdenes", percentage: 0 },
							{ module: "Permisos", percentage: 0 },
							{ module: "Mant.", percentage: 0 },
						]
					}
					isLoading={isLoading}
				/>
				<WeeklyActivityChart
					data={
						data?.weeklyActivityData || [
							{ day: "Lun", workOrders: 0, permits: 0, maintenance: 0 },
							{ day: "Mar", workOrders: 0, permits: 0, maintenance: 0 },
							{ day: "Mie", workOrders: 0, permits: 0, maintenance: 0 },
							{ day: "Jue", workOrders: 0, permits: 0, maintenance: 0 },
							{ day: "Vie", workOrders: 0, permits: 0, maintenance: 0 },
							{ day: "Sab", workOrders: 0, permits: 0, maintenance: 0 },
							{ day: "Dom", workOrders: 0, permits: 0, maintenance: 0 },
						]
					}
					isLoading={isLoading}
				/>
			</div>

			{/* Alerts and Recent Activity */}
			<div className="grid gap-4 md:grid-cols-2">
				<SystemAlerts alerts={data?.alerts || []} isLoading={isLoading} />
				<RecentActivity activities={data?.recentActivity || []} isLoading={isLoading} />
			</div>

			{/* Key Metrics */}
			<KeyMetrics isLoading={isLoading} />
		</div>
	)
}
