"use client"

import { useMaintenancePlanStats } from "@/project/maintenance-plan/hooks/use-maintenance-plan-stats"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import MaintenancePlanFrequencyChart from "./MaintenancePlanFrequencyChart"
import MaintenancePlanPriorityChart from "./MaintenancePlanPriorityChart"
import MaintenancePlanMonthlyChart from "./MaintenancePlanMonthlyChart"
import MaintenancePlanStatsCards from "./MaintenancePlanStatsCards"
import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"

export default function MaintenancePlanStatsContainer() {
	const { data, isLoading } = useMaintenancePlanStats()

	if (isLoading || !data) return <ChartSkeleton />

	return (
		<Tabs className="space-y-2" defaultValue="stats">
			<TabsList className="h-11 w-full py-5">
				<TabsTrigger className="h-8" value="stats">
					Estadisticas
				</TabsTrigger>
				<TabsTrigger className="h-8" value="charts">
					Graficas
				</TabsTrigger>
			</TabsList>

			<TabsContent value="stats">
				<MaintenancePlanStatsCards stats={data.basicStats} />
			</TabsContent>

			<TabsContent value="charts">
				<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
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

					<MaintenancePlanFrequencyChart data={data.pieChartData} />

					{data.monthlyCompletedStats && data.monthlyCompletedStats.length > 0 && (
						<MaintenancePlanMonthlyChart data={data.monthlyCompletedStats} />
					)}
				</div>
			</TabsContent>
		</Tabs>
	)
}
