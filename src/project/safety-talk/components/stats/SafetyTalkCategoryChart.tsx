"use client"

import { Cell, Label, Pie, PieChart } from "recharts"
import { ChartPieIcon } from "lucide-react"
import { useState } from "react"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

const COLORS = ["var(--color-sky-500)", "var(--color-emerald-500)", "var(--color-teal-500)"]

const CATEGORY_LABELS = {
	VISITOR: "Visitas - Hualpén",
	VISITOR_TRM: "Visitas - El Avellano",
	IRL: "IRL",
}

interface SafetyTalkCategoryChartProps {
	data: Array<{
		name: string
		value: number
	}>
}

export function SafetyTalkCategoryChart({ data }: SafetyTalkCategoryChartProps) {
	const [hoveredName, setHoveredName] = useState<string | null>(null)
	const total = data.reduce((acc, item) => acc + item.value, 0)

	const chartItems = data
		.filter((item) => item.value > 0)
		.map((item, index) => ({
			...item,
			fill: COLORS[index % COLORS.length],
			percentage: total === 0 ? 0 : (item.value / total) * 100,
		}))

	return (
		<Card className="border-none">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Distribución por Categoría</CardTitle>
						<CardDescription>Total de charlas realizadas por categoría</CardDescription>
					</div>
					<div className="rounded-lg bg-emerald-500/10 p-1.5">
						<ChartPieIcon className="size-5 text-emerald-500" />
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<div className="flex w-full flex-col items-center justify-center gap-6 md:flex-row md:items-center md:justify-between">
					<ChartContainer
						config={{
							ENVIRONMENT: {
								label: "Medio Ambiente",
							},
							IRL: {
								label: "IRL",
							},
						}}
						className="h-62.5 w-full md:max-w-72"
					>
						<PieChart>
							<Pie
								cy="50%"
								cx="50%"
								data={chartItems}
								dataKey="value"
								innerRadius={45}
								paddingAngle={3}
								cornerRadius={8}
								onMouseLeave={() => setHoveredName(null)}
							>
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

								{chartItems.map((item) => (
									<Cell
										key={`cell-${item.name}`}
										fill={item.fill}
										fillOpacity={hoveredName && hoveredName !== item.name ? 0.25 : 1}
										stroke={hoveredName === item.name ? "var(--color-background)" : "transparent"}
										strokeWidth={hoveredName === item.name ? 3 : 0}
										onMouseEnter={() => setHoveredName(item.name)}
										onMouseLeave={() => setHoveredName(null)}
									/>
								))}
							</Pie>
							<ChartTooltip content={<ChartTooltipContent />} />
						</PieChart>
					</ChartContainer>

					<div className="w-full space-y-3 md:max-w-70">
						{chartItems.map((item) => (
							<div
								key={item.name}
								className="flex items-center justify-between gap-4 transition-opacity"
								style={{ opacity: hoveredName && hoveredName !== item.name ? 0.35 : 1 }}
								onMouseEnter={() => setHoveredName(item.name)}
								onMouseLeave={() => setHoveredName(null)}
							>
								<div className="flex min-w-0 items-center gap-2">
									<span
										className="h-2.5 w-2.5 shrink-0 rounded-full"
										style={{ backgroundColor: item.fill }}
									/>
									<p className="truncate text-sm font-medium">
										{CATEGORY_LABELS[item.name as keyof typeof CATEGORY_LABELS]}
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
