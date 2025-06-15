"use client"

import { useMaintenancePlanStats } from "@/project/maintenance-plan/hooks/use-maintenance-plan-stats"

import MaintenancePlanFrequencyChart from "./MaintenancePlanFrequencyChart"
import MaintenancePlanPriorityChart from "./MaintenancePlanPriorityChart"
import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"
import MaintenancePlanStatsCards from "./MaintenancePlanStatsCards"
import MaintenancePlanChart from "./MaintenancePlanChart"

export default function MaintenancePlanStatsContainer() {
	const { data, isLoading } = useMaintenancePlanStats()

	if (isLoading || !data) return <ChartSkeleton />

	return (
		<div className="flex flex-col gap-4">
			<MaintenancePlanStatsCards stats={data.basicStats} />

			<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
				<MaintenancePlanFrequencyChart
					data={data.pieChartData}
					total={data.basicStats.totalPlans}
				/>
				<MaintenancePlanPriorityChart
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
				<MaintenancePlanChart data={data.areaChartData} />
			</div>
		</div>
	)
}
