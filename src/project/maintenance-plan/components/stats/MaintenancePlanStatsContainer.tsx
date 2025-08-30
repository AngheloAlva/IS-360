"use client"

import { useMaintenancePlanStats } from "@/project/maintenance-plan/hooks/use-maintenance-plan-stats"

import MaintenancePlanFrequencyChart from "./MaintenancePlanFrequencyChart"
import MaintenancePlanPriorityChart from "./MaintenancePlanPriorityChart"
import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"
import MaintenancePlanStatsCards from "./MaintenancePlanStatsCards"

export default function MaintenancePlanStatsContainer() {
	const { data, isLoading } = useMaintenancePlanStats()

	if (isLoading || !data) return <ChartSkeleton />

	return (
		<div className="flex flex-col gap-4">
			<MaintenancePlanStatsCards stats={data.basicStats} />

			<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
				<div className="xl:col-span-2">
					<MaintenancePlanFrequencyChart data={data.pieChartData} />
				</div>

				<MaintenancePlanPriorityChart
					total={data.basicStats.totalTasks}
					data={
						data.barChartData.length > 0
							? data.barChartData
							: [
									{
										name: "Alta",
										value: 0,
										fill: "var(--color-red-500)",
										priority: "HIGH",
									},
									{
										name: "Media",
										value: 0,
										fill: "var(--color-yellow-500)",
										priority: "MEDIUM",
									},
									{
										name: "Baja",
										value: 0,
										fill: "var(--color-green-500)",
										priority: "LOW",
									},
								]
					}
				/>
			</div>
		</div>
	)
}
