"use client"

import { useState } from "react"
import { Cell, Label, Pie, PieChart as RechartsPieChart } from "recharts"

import { ChartTooltip, ChartContainer, ChartTooltipContent } from "@/shared/components/ui/chart"

interface PieChartProps {
	data: Array<{ name: string; value: number; fill?: string }>
	colors?: string[]
}

const DEFAULT_COLORS = [
	"#2563eb",
	"#10b981",
	"#f59e0b",
	"#ef4444",
	"#8b5cf6",
	"#06b6d4",
	"#84cc16",
	"#f97316",
] as const

export function PieChart({ data, colors }: PieChartProps) {
	const [hoveredName, setHoveredName] = useState<string | null>(null)
	const filteredData = data.filter((item) => item.value > 0)
	const total = filteredData.reduce((acc, item) => acc + item.value, 0)

	const chartItems = filteredData.map((item, index) => {
		const fill =
			item.fill ||
			(colors ? colors[index % colors.length] : DEFAULT_COLORS[index % DEFAULT_COLORS.length])

		return {
			...item,
			fill,
			percentage: total === 0 ? 0 : (item.value / total) * 100,
		}
	})

	return (
		<div className="flex h-75 w-full flex-col items-center justify-center gap-6 md:flex-row md:items-center md:justify-between">
			<ChartContainer className="h-full w-full md:max-w-72" config={{}}>
				<RechartsPieChart>
					<Pie
						cx="50%"
						cy="45%"
						nameKey="name"
						dataKey="value"
						paddingAngle={3}
						innerRadius={45}
						cornerRadius={8}
						outerRadius={100}
						data={chartItems}
						onMouseLeave={() => setHoveredName(null)}
					>
						{chartItems.map((entry) => (
							<Cell
								key={`cell-${entry.name}`}
								fill={entry.fill}
								fillOpacity={hoveredName && hoveredName !== entry.name ? 0.25 : 1}
								strokeWidth={hoveredName === entry.name ? 3 : 0}
								onMouseEnter={() => setHoveredName(entry.name)}
								onMouseLeave={() => setHoveredName(null)}
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

					<ChartTooltip content={<ChartTooltipContent />} />
				</RechartsPieChart>
			</ChartContainer>

			<div className="w-full md:max-w-65">
				{chartItems.map((item) => (
					<div
						key={item.name}
						className="flex items-center justify-between gap-4 py-1.5 transition-opacity"
						style={{ opacity: hoveredName && hoveredName !== item.name ? 0.35 : 1 }}
						onMouseEnter={() => setHoveredName(item.name)}
						onMouseLeave={() => setHoveredName(null)}
					>
						<div className="flex min-w-0 items-center gap-2">
							<span
								className="h-2.5 w-2.5 shrink-0 rounded-full"
								style={{ backgroundColor: item.fill }}
							/>
							<p className="truncate text-sm font-medium">{item.name}</p>
						</div>

						<p className="text-muted-foreground shrink-0 text-sm">
							{item.value.toLocaleString("es-CL")} ({item.percentage.toFixed(1)}%)
						</p>
					</div>
				))}
			</div>
		</div>
	)
}
