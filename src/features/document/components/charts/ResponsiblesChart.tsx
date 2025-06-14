"use client"

import { Bar, Cell, YAxis, XAxis, CartesianGrid, BarChart as RechartsBarChart } from "recharts"

import { Card } from "@/shared/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/shared/components/ui/chart"

interface BarChartProps {
	data: Array<{ name: string; value: number; fill?: string }>
	colors?: string[]
}

export function ResponsiblesChart({ data, colors }: BarChartProps) {
	return (
		<ChartContainer config={{}} className="h-[350px] w-full">
			<RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
				<CartesianGrid strokeDasharray="3 3" vertical={false} />
				<XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
				<YAxis />
				<ChartTooltip
					content={({ active, payload }) => {
						if (active && payload && payload.length) {
							return (
								<Card className="bg-background border p-2 shadow-sm">
									<div className="text-sm font-medium">{payload[0].payload.name}</div>
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
									: `#${Math.floor(Math.random() * 16777215).toString(16)}`)
							}
						/>
					))}
				</Bar>
			</RechartsBarChart>
		</ChartContainer>
	)
}
