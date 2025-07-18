"use client"

import { PieChart, Pie, Cell } from "recharts"
import { PieChartIcon } from "lucide-react"

import { useWorkOrderFiltersStore } from "@/project/work-order/stores/work-order-filters-store"

import type { WorkOrderStatsResponse } from "@/project/work-order/hooks/use-work-order-stats"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"
import {
	ChartLegend,
	ChartTooltip,
	ChartContainer,
	ChartLegendContent,
	ChartTooltipContent,
} from "@/shared/components/ui/chart"

interface WorkOrderStatusChartProps {
	data: WorkOrderStatsResponse
}

const COLORS = [
	"var(--color-orange-500)",
	"var(--color-yellow-500)",
	"var(--color-amber-500)",
	"var(--color-red-500)",
]

export function WorkOrderStatusChart({ data }: WorkOrderStatusChartProps) {
	const statusData = data.charts.type
	const { setTypeFilter, statusFilter } = useWorkOrderFiltersStore()

	const handleChartClick = (data: { name: string }) => {
		const clickedStatus = data.name

		if (statusFilter === clickedStatus) {
			setTypeFilter(null)
		} else {
			setTypeFilter(clickedStatus)
		}

		// setTimeout(() => {
		// 	document.getElementById("work-order-table")?.scrollIntoView({
		// 		behavior: "smooth",
		// 		block: "start",
		// 	})
		// }, 100)
	}

	return (
		<Card className="border-none transition-shadow hover:shadow-md">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-lg font-semibold">Distribución por Tipo</CardTitle>
						<CardDescription>Órdenes de Trabajo dividas por tipo</CardDescription>
					</div>
					<PieChartIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="px-0">
				<ChartContainer
					className="h-[250px] w-full max-w-[90dvw]"
					config={{
						CORRECTIVE: {
							label: "Correctivas",
						},
						PREVENTIVE: {
							label: "Preventivas",
						},
						PREDICTIVE: {
							label: "Predictivas",
						},
						PROACTIVE: {
							label: "Proactivas",
						},
					}}
				>
					<PieChart margin={{ top: 10 }}>
						<Pie
							label
							cx="50%"
							cy="50%"
							nameKey="name"
							dataKey="value"
							innerRadius={45}
							paddingAngle={5}
							data={statusData}
							onClick={handleChartClick}
						>
							{statusData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={COLORS[index % COLORS.length]}
									strokeWidth={statusFilter === entry.name ? 2 : 0}
									stroke={statusFilter === entry.name ? "var(--text)" : "none"}
									className="cursor-pointer hover:brightness-75"
								/>
							))}
						</Pie>
						<ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
						<ChartLegend content={<ChartLegendContent />} />
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
