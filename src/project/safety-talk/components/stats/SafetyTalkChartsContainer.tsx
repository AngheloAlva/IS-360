"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { SafetyTalkMonthlyTrendChart } from "./SafetyTalkMonthlyTrendChart"
import { useSafetyTalkCharts } from "../../hooks/use-safety-talk-charts"
import { useSafetyTalkStats } from "../../hooks/use-safety-talk-stats"
import { SafetyTalkCategoryChart } from "./SafetyTalkCategoryChart"
import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"
import { SafetyTalkStatusChart } from "./SafetyTalkStatusChart"
import { SafetyTalkStats } from "./SafetyTalkStats"

export function SafetyTalkChartsContainer() {
	const { data: charts, isLoading } = useSafetyTalkCharts()
	const { data: stats, isLoading: isLoadingStats } = useSafetyTalkStats()

	if (isLoading || isLoadingStats) return <ChartSkeleton />

	if (!charts || !stats) return null

	return (
		<Tabs className="space-y-4" defaultValue="stats">
			<TabsList className="h-11 w-full py-5">
				<TabsTrigger className="h-8" value="stats">
					Estadisticas
				</TabsTrigger>
				<TabsTrigger className="h-8" value="charts">
					Graficas
				</TabsTrigger>
			</TabsList>

			<TabsContent value="stats">
				<SafetyTalkStats
					data={{
						totalCompleted: stats.totalSafetyTalks,
						totalPassed: stats.approvedSafetyTalks,
						totalFailed: stats.expiredSafetyTalks,
						totalPending: stats.pendingApprovalSafetyTalks,
					}}
				/>
			</TabsContent>

			<TabsContent value="charts">
				<div className="grid gap-4 lg:grid-cols-3">
					<SafetyTalkCategoryChart data={charts.byCategory} />
					<SafetyTalkStatusChart data={charts.byStatus} />
					<SafetyTalkMonthlyTrendChart data={charts.monthlyTrend} />
				</div>
			</TabsContent>
		</Tabs>
	)
}
