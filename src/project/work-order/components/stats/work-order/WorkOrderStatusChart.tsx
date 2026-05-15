"use client"

import { PieChart, Pie, Cell, Label } from "recharts"
import { PieChartIcon } from "lucide-react"
import { useState } from "react"

import { useWorkOrderFiltersStore } from "@/project/work-order/stores/work-order-filters-store"

import { ChartTooltip, ChartContainer, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

import type { WorkOrderStatsResponse } from "@/project/work-order/hooks/use-work-order-stats"

interface WorkOrderStatusChartProps {
	total: number
	data: WorkOrderStatsResponse
}

const TYPE_LABELS = {
	CORRECTIVE: "Correctivas",
	PREVENTIVE: "Preventivas",
	PREDICTIVE: "Predictivas",
	PROACTIVE: "Proactivas",
} as const

const TYPE_COLORS = {
	CORRECTIVE: "var(--color-red-500)",
	PREVENTIVE: "var(--color-orange-500)",
	PREDICTIVE: "var(--color-yellow-500)",
	PROACTIVE: "var(--color-amber-500)",
} as const

export function WorkOrderTypeChart({ data, total }: WorkOrderStatusChartProps) {
	const typeData = data.charts.type
	const { setTypeFilter, typeFilter } = useWorkOrderFiltersStore()
	const [hoveredType, setHoveredType] = useState<string | null>(null)

	const chartItems = typeData
		.filter((item) => item.value > 0)
		.map((item) => ({
			...item,
			fill:
				item.fill ??
				TYPE_COLORS[item.name as keyof typeof TYPE_COLORS] ??
				"var(--color-neutral-500)",
			percentage: total === 0 ? 0 : (item.value / total) * 100,
		}))

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
					<div className="rounded-lg bg-orange-500/10 p-1.5">
						<PieChartIcon className="size-5 text-orange-500" />
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex w-full flex-col items-center justify-center gap-6 md:flex-row md:items-center md:justify-between">
					<ChartContainer
						className="h-62.5 w-full md:max-w-72"
						config={{
							CORRECTIVE: {
								label: TYPE_LABELS.CORRECTIVE,
							},
							PREVENTIVE: {
								label: TYPE_LABELS.PREVENTIVE,
							},
							PREDICTIVE: {
								label: TYPE_LABELS.PREDICTIVE,
							},
							PROACTIVE: {
								label: TYPE_LABELS.PROACTIVE,
							},
						}}
					>
						<PieChart margin={{ top: 10 }}>
							<Pie
								cx="50%"
								cy="50%"
								nameKey="name"
								dataKey="value"
								innerRadius={45}
								cornerRadius={8}
								paddingAngle={5}
								data={chartItems}
								onClick={handleChartClick}
								onMouseLeave={() => setHoveredType(null)}
							>
								{chartItems.map((entry) => (
									<Cell
										key={`cell-${entry.name}`}
										fill={entry.fill}
										fillOpacity={hoveredType && hoveredType !== entry.name ? 0.25 : 1}
										className="cursor-pointer"
										onMouseEnter={() => setHoveredType(entry.name)}
										onMouseLeave={() => setHoveredType(null)}
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
														{total.toLocaleString("es-CL")}
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
						</PieChart>
					</ChartContainer>

					<div className="w-full md:max-w-75">
						{chartItems.map((item) => (
							<div
								key={item.name}
								className="flex cursor-pointer items-center justify-between gap-4 rounded-md px-2 py-2 transition-opacity"
								style={{ opacity: hoveredType && hoveredType !== item.name ? 0.35 : 1 }}
								onMouseEnter={() => setHoveredType(item.name)}
								onMouseLeave={() => setHoveredType(null)}
								onClick={() => handleChartClick({ name: item.name })}
							>
								<div className="flex min-w-0 items-center gap-2">
									<span
										className="h-2.5 w-2.5 shrink-0 rounded-full"
										style={{ backgroundColor: item.fill }}
									/>
									<p className="truncate text-sm font-medium">
										{TYPE_LABELS[item.name as keyof typeof TYPE_LABELS] ?? item.name}
									</p>
								</div>

								<p className="text-muted-foreground shrink-0 text-sm">
									{item.value.toLocaleString("es-CL")} ({item.percentage.toFixed(1)}%)
								</p>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
