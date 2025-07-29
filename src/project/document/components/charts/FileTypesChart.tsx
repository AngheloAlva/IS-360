"use client"

import { Cell, Label, Pie, PieChart as RechartsPieChart } from "recharts"

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
	const filteredData = data.filter((item) => item.value > 0)
	const total = filteredData.reduce((acc, item) => acc + item.value, 0)

	return (
		<ChartContainer className="h-[300px] w-full" config={{}}>
			<RechartsPieChart>
				<Pie
					cx="50%"
					cy="50%"
					nameKey="name"
					dataKey="value"
					paddingAngle={3}
					innerRadius={45}
					outerRadius={100}
					data={filteredData}
					label={({ name, value }) => `${name}: ${((value / total) * 100).toFixed(1)}%`}
					labelLine={false}
				>
					{filteredData.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
					))}
					<Label
						content={({ viewBox }) => {
							if (viewBox && "cx" in viewBox && "cy" in viewBox) {
								return (
									<text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
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
							const data = payload[0].payload
							const percentage = ((data.value / total) * 100).toFixed(1)
							return (
								<div className="bg-background rounded-lg border p-2 shadow-md">
									<div className="grid grid-cols-2 gap-2">
										<div className="flex flex-col">
											<span className="text-muted-foreground text-[0.70rem] uppercase">Tipo</span>
											<span className="text-muted-foreground font-bold">{data.name}</span>
										</div>
										<div className="flex flex-col">
											<span className="text-muted-foreground text-[0.70rem] uppercase">
												Cantidad
											</span>
											<span className="font-bold">
												{data.value} ({percentage}%)
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
	)
}
