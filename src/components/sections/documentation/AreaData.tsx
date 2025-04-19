"use client"

import {
	Bar,
	Cell,
	YAxis,
	XAxis,
	Tooltip,
	CartesianGrid,
	ResponsiveContainer,
	BarChart as RechartsBarChart,
} from "recharts"

import { Card } from "@/components/ui/card"

interface AreaChartProps {
	data: Array<{ name: string; value: number; fill?: string }>
}

export function AreaChart({ data }: AreaChartProps) {
	return (
		<ResponsiveContainer width="100%" height={350}>
			<RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
				<CartesianGrid strokeDasharray="3 3" vertical={false} />
				<XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
				<YAxis />
				<Tooltip
					content={({ active, payload }) => {
						if (active && payload && payload.length) {
							return (
								<Card className="border bg-white p-2 shadow-sm">
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
							fill={entry.fill || `#${Math.floor(Math.random() * 16777215).toString(16)}`}
						/>
					))}
				</Bar>
			</RechartsBarChart>
		</ResponsiveContainer>
	)
}
