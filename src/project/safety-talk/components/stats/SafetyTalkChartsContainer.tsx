"use client"

import { SafetyTalkMonthlyTrendChart } from "./SafetyTalkMonthlyTrendChart"
import { useSafetyTalkCharts } from "../../hooks/use-safety-talk-charts"
import { SafetyTalkCategoryChart } from "./SafetyTalkCategoryChart"
import { SafetyTalkStatusChart } from "./SafetyTalkStatusChart"

export function SafetyTalkChartsContainer() {
	const { data: charts, isLoading } = useSafetyTalkCharts()

	if (isLoading || !charts) return null

	return (
		<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			<SafetyTalkCategoryChart data={charts.byCategory} />
			<SafetyTalkStatusChart data={charts.byStatus} />
			<SafetyTalkMonthlyTrendChart data={charts.monthlyTrend} />
		</div>
	)
}
