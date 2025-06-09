"use client"

import { useMaintenancePlanStats } from "@/hooks/maintenance-plans/use-maintenance-plan-stats"

import MaintenancePlanFrequencyPieChart from "./maintenance-plan-frequency-pie-chart"
import MaintenancePlanPriorityBarChart from "./maintenance-plan-priority-bar-chart"
import MaintenancePlanStatsCards from "./maintenance-plan-stats-cards"
import ChartSkeleton from "@/components/sections/charts/ChartSkeleton"
import MaintenancePlanAreaChart from "./maintenance-plan-area-chart"

export default function MaintenancePlanDashboardStats() {
	const { data, isLoading } = useMaintenancePlanStats()

	if (isLoading || !data) return <ChartSkeleton />

	return (
		<div className="flex flex-col gap-4">
			<MaintenancePlanStatsCards stats={data.basicStats} />

			<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
				<MaintenancePlanFrequencyPieChart
					data={data.pieChartData}
					total={data.basicStats.totalPlans}
				/>
				<MaintenancePlanPriorityBarChart
					data={
						data.barChartData.length > 0
							? data.barChartData
							: [
									{
										name: "Alta",
										value: 0,
										priority: "HIGH",
									},
									{
										name: "Media",
										value: 0,
										priority: "MEDIUM",
									},
									{
										name: "Baja",
										value: 0,
										priority: "LOW",
									},
								]
					}
				/>
				<MaintenancePlanAreaChart data={data.areaChartData} />
			</div>
		</div>
	)
}
