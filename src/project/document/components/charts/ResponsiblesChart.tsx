"use client"

import { Bar, Cell, YAxis, XAxis, CartesianGrid, BarChart as RechartsBarChart } from "recharts"

import { ChartContainer, ChartTooltip } from "@/shared/components/ui/chart"
import { Card } from "@/shared/components/ui/card"

interface BarChartProps {
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

export function ResponsiblesChart({ data, colors }: BarChartProps) {
	return (
		<ChartContainer config={{}} className="h-72 w-full">
			<RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
				<CartesianGrid strokeDasharray="3 3" vertical={false} />
				<XAxis dataKey="name" angle={-25} textAnchor="end" height={20} tick={{ fontSize: 12 }} />
				<YAxis />
				<ChartTooltip
					content={({ active, payload }) => {
						if (active && payload && payload.length) {
							return (
								<Card className="bg-background border p-2 shadow-sm">
									<div className="text-sm font-semibold">{payload[0].payload.name}</div>
									<div className="text-sm">Cantidad: {payload[0].value}</div>
								</Card>
							)
						}
						return null
					}}
				/>
				<Bar dataKey="value" radius={[4, 4, 0, 0]}>
					{data.map((entry, index) => (
						<Cell
							key={`cell-${index}`}
							fill={
								entry.fill ||
								(colors
									? colors[index % colors.length]
									: DEFAULT_COLORS[index % DEFAULT_COLORS.length])
							}
						/>
					))}
				</Bar>
			</RechartsBarChart>
		</ChartContainer>
	)
}
