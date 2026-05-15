"use client"

import { Cell, Label, Pie, PieChart as RechartsPieChart } from "recharts"
import { useState } from "react"

import { ChartTooltip, ChartContainer } from "@/shared/components/ui/chart"

interface FileTypesChartProps {
	data: Array<{ name: string; value: number }>
}

const COLORS = [
	"#3b82f6", // blue-500
	"#10b981", // emerald-500
	"#f59e0b", // amber-500
	"#ef4444", // red-500
	"#8b5cf6", // violet-500
	"#06b6d4", // cyan-500
	"#84cc16", // lime-500
	"#f97316", // orange-500
]

export function FileTypesChart({ data }: FileTypesChartProps) {
	const [hoveredName, setHoveredName] = useState<string | null>(null)
	const filteredData = data.filter((item) => item.value > 0)
	const total = filteredData.reduce((acc, item) => acc + item.value, 0)

	const chartItems = filteredData.map((item, index) => ({
		...item,
		fill: COLORS[index % COLORS.length],
		percentage: total === 0 ? 0 : (item.value / total) * 100,
	}))

	return (
		<div className="flex w-full flex-col items-center justify-center gap-6 md:flex-row md:items-center md:justify-between">
			<ChartContainer className="h-75 w-full md:max-w-80" config={{}}>
				<RechartsPieChart>
					<Pie
						cx="50%"
						cy="50%"
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

					<ChartTooltip
						content={({ active, payload }) => {
							if (active && payload && payload.length) {
								const row = payload[0].payload as { name: string; value: number }
								const percentage = total === 0 ? 0 : (row.value / total) * 100

								return (
									<div className="bg-background rounded-lg border p-2 shadow-md">
										<div className="grid grid-cols-2 gap-2">
											<div className="flex flex-col">
												<span className="text-muted-foreground text-[0.70rem] uppercase">Tipo</span>
												<span className="text-muted-foreground font-bold">{row.name}</span>
											</div>
											<div className="flex flex-col">
												<span className="text-muted-foreground text-[0.70rem] uppercase">
													Cantidad
												</span>
												<span className="font-bold">
													{row.value.toLocaleString("es-CL")} ({percentage.toFixed(1)}%)
												</span>
											</div>
										</div>
									</div>
								)
							}

							return null
						}}
					/>
				</RechartsPieChart>
			</ChartContainer>

			<div className="w-full md:max-w-70">
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
