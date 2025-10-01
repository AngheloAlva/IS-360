"use client"

import { PieChart, Pie, Cell, Label } from "recharts"
import { PieChartIcon } from "lucide-react"

import { useWorkOrderFiltersStore } from "@/project/work-order/stores/work-order-filters-store"

import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"
import {
	ChartLegend,
	ChartTooltip,
	ChartContainer,
	ChartLegendContent,
	ChartTooltipContent,
} from "@/shared/components/ui/chart"

import type { WorkOrderStatsResponse } from "@/project/work-order/hooks/use-work-order-stats"

interface WorkOrderStatusChartProps {
	total: number
	data: WorkOrderStatsResponse
}

export function WorkOrderTypeChart({ data, total }: WorkOrderStatusChartProps) {
	const typeData = data.charts.type
	const { setTypeFilter, typeFilter } = useWorkOrderFiltersStore()

	const handleChartClick = (data: { name: string }) => {
		const clickedStatus = data.name

		if (typeFilter === clickedStatus) {
			setTypeFilter(null)
		} else {
			setTypeFilter(clickedStatus)
		}
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
							data={typeData}
							onClick={handleChartClick}
						>
							{typeData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									strokeWidth={typeFilter === entry.name ? 2 : 0}
									stroke={typeFilter === entry.name ? "var(--text)" : "none"}
									className="cursor-pointer hover:brightness-75"
								/>
							))}

							<Label
								content={({ viewBox }) => {
									if (viewBox && "cx" in viewBox && "cy" in viewBox) {
										return (
											<text
												x={viewBox.cx}
												y={viewBox.cy}
												textAnchor="middle"
												dominantBaseline="middle"
											>
												<tspan
													x={viewBox.cx}
													y={viewBox.cy}
													className="fill-foreground text-2xl font-semibold"
												>
													{total}
												</tspan>
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy || 0) + 24}
													className="fill-muted-foreground text-sm"
												>
													Total
												</tspan>
											</text>
										)
									}
								}}
							/>
						</Pie>

						<ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
						<ChartLegend content={<ChartLegendContent nameKey="name" />} />
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
