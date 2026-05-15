"use client"

import { useMaintenancePlanSpecificStats } from "@/project/maintenance-plan/hooks/use-maintenance-plan-specific-stats"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import MaintenancePlanOperationalInsights from "./MaintenancePlanOperationalInsights"
import MaintenancePlanMonthlyChart from "./MaintenancePlanMonthlyChart"
import { Skeleton } from "@/shared/components/ui/skeleton"
import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"

interface MaintenancePlanMonthlyStatsContainerProps {
	planSlug: string
}

export default function MaintenancePlanMonthlyStatsContainer({
	planSlug,
}: MaintenancePlanMonthlyStatsContainerProps) {
	const { data, isLoading } = useMaintenancePlanSpecificStats({ planSlug })

	if (isLoading) return <ChartSkeleton />

	if (!data) return null

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
				<MaintenancePlanOperationalInsights health={data.health} risk={data.risk} />
			</TabsContent>

			<TabsContent value="charts">
				{data.monthlyStats.length > 0 && <MaintenancePlanMonthlyChart data={data.monthlyStats} />}
			</TabsContent>
		</Tabs>
	)
}
