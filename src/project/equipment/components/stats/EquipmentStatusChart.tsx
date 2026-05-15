"use client"

import { Cell, Label, Pie, PieChart } from "recharts"
import { PieChartIcon } from "lucide-react"
import { useState } from "react"

import { EquipmentStatusData } from "@/project/equipment/hooks/use-equipment-stats"

import { ChartTooltip, ChartContainer, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

interface EquipmentStatusChartProps {
	data: EquipmentStatusData[]
}

const STATUS_COLORS = {
	"Con OT": "var(--color-emerald-500)",
	"Sin OT": "var(--color-teal-500)",
} as const

export default function EquipmentStatusChart({ data }: EquipmentStatusChartProps) {
	const [hoveredStatus, setHoveredStatus] = useState<string | null>(null)
	const total = data.reduce((acc, item) => acc + item.count, 0)

	const chartItems = data
		.filter((item) => item.count > 0)
		.map((item, index) => ({
			...item,
			fill:
				STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] ??
				(index % 2 === 0 ? "var(--color-emerald-500)" : "var(--color-teal-500)"),
			percentage: total === 0 ? 0 : (item.count / total) * 100,
		}))

	return (
		<Card className="border-none">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Equipos con Órdenes de Trabajo</CardTitle>
						<CardDescription>Equipos que tienen órdenes de trabajo relacionadas</CardDescription>
					</div>
					<div className="rounded-lg bg-emerald-500/10 p-1.5">
						<PieChartIcon className="size-5 text-emerald-500" />
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex h-62.5 flex-col items-center justify-center gap-6 px-2 md:h-auto md:flex-row md:items-center md:justify-between">
					<ChartContainer
						config={{
							"Con OT": {
								label: "Con Órdenes de Trabajo",
							},
							"Sin OT": {
								label: "Sin Órdenes de Trabajo",
							},
						}}
						className="h-60 md:max-w-60"
					>
						<PieChart>
							<ChartTooltip content={<ChartTooltipContent />} />
							<Pie
								data={chartItems}
								cx="50%"
								cy="50%"
								dataKey="count"
								nameKey="status"
								innerRadius={45}
								paddingAngle={3}
								cornerRadius={8}
								onMouseLeave={() => setHoveredStatus(null)}
							>
								{chartItems.map((item) => (
									<Cell
										key={`cell-${item.status}`}
										fill={item.fill}
										fillOpacity={hoveredStatus && hoveredStatus !== item.status ? 0.25 : 1}
										stroke={
											hoveredStatus === item.status ? "var(--color-background)" : "transparent"
										}
										strokeWidth={hoveredStatus === item.status ? 2 : 0}
										onMouseEnter={() => setHoveredStatus(item.status)}
										onMouseLeave={() => setHoveredStatus(null)}
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
						</PieChart>
					</ChartContainer>

					<div className="w-full md:max-w-75">
						{chartItems.map((item) => (
							<div
								key={item.status}
								className="flex items-center justify-between gap-4 rounded-md px-2 py-2 transition-opacity"
								style={{ opacity: hoveredStatus && hoveredStatus !== item.status ? 0.35 : 1 }}
								onMouseEnter={() => setHoveredStatus(item.status)}
								onMouseLeave={() => setHoveredStatus(null)}
							>
								<div className="flex min-w-0 items-center gap-2">
									<span
										className="h-2.5 w-2.5 shrink-0 rounded-full"
										style={{ backgroundColor: item.fill }}
									/>
									<p className="truncate text-sm font-medium">{item.status}</p>
								</div>

								<p className="text-muted-foreground shrink-0 text-sm">
									{item.count.toLocaleString("es-CL")} ({item.percentage.toFixed(1)}%)
								</p>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
