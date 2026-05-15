"use client"

import { PieChart, Pie, Cell, Label } from "recharts"
import { PieChartIcon } from "lucide-react"
import { useState } from "react"

import { ChartTooltip, ChartContainer, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

import type { BarChartItem } from "@/project/maintenance-plan/hooks/use-maintenance-plan-stats"

interface MaintenancePlanPriorityChartProps {
	data: BarChartItem[]
	total: number
}

const PRIORITY_LABELS = {
	HIGH: "Alta",
	MEDIUM: "Media",
	LOW: "Baja",
} as const

export default function MaintenancePlanPriorityChart({
	data,
	total,
}: MaintenancePlanPriorityChartProps) {
	const [hoveredPriority, setHoveredPriority] = useState<string | null>(null)

	const chartItems = data
		.filter((item) => item.value > 0)
		.map((item) => ({
			...item,
			label: PRIORITY_LABELS[item.priority as keyof typeof PRIORITY_LABELS] ?? item.priority,
			percentage: total === 0 ? 0 : (item.value / total) * 100,
		}))

	return (
		<Card className="border">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Tareas por Prioridad</CardTitle>
						<CardDescription>Distribución de las tareas según su prioridad</CardDescription>
					</div>
					<div className="rounded-lg bg-red-500/10 p-1.5">
						<PieChartIcon className="size-5 text-red-500" />
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex w-full flex-col items-center justify-center gap-6 md:flex-row md:items-center md:justify-between">
					<ChartContainer
						config={{
							HIGH: {
								label: PRIORITY_LABELS.HIGH,
							},
							MEDIUM: {
								label: PRIORITY_LABELS.MEDIUM,
							},
							LOW: {
								label: PRIORITY_LABELS.LOW,
							},
						}}
						className="h-62.5 w-full md:max-w-72"
					>
						<PieChart>
							<Pie
								cx="50%"
								cy="50%"
								dataKey="value"
								innerRadius={45}
								cornerRadius={8}
								paddingAngle={3}
								data={chartItems}
								nameKey="priority"
								onMouseLeave={() => setHoveredPriority(null)}
							>
								{chartItems.map((item) => (
									<Cell
										key={`cell-${item.priority}`}
										fill={item.fill}
										fillOpacity={hoveredPriority && hoveredPriority !== item.priority ? 0.25 : 1}
										stroke={
											hoveredPriority === item.priority ? "var(--color-background)" : "transparent"
										}
										strokeWidth={hoveredPriority === item.priority ? 2 : 0}
										onMouseEnter={() => setHoveredPriority(item.priority)}
										onMouseLeave={() => setHoveredPriority(null)}
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
														className="fill-foreground text-2xl font-bold"
													>
														{total.toLocaleString()}
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
							<ChartTooltip content={<ChartTooltipContent />} />
						</PieChart>
					</ChartContainer>

					<div className="w-full md:max-w-75">
						{chartItems.map((item) => (
							<div
								key={item.priority}
								className="flex items-center justify-between gap-4 rounded-md px-2 py-2 transition-opacity"
								style={{ opacity: hoveredPriority && hoveredPriority !== item.priority ? 0.35 : 1 }}
								onMouseEnter={() => setHoveredPriority(item.priority)}
								onMouseLeave={() => setHoveredPriority(null)}
							>
								<div className="flex min-w-0 items-center gap-2">
									<span
										className="h-2.5 w-2.5 shrink-0 rounded-full"
										style={{ backgroundColor: item.fill }}
									/>
									<p className="truncate text-sm font-medium">{item.label}</p>
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
