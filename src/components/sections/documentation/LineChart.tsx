"use client"

import {
	Line,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	ResponsiveContainer,
	LineChart as RechartsLineChart,
} from "recharts"

import { Card } from "@/components/ui/card"

interface LineChartProps {
	data: {
		date: string
		cambios: number
	}[]
}

export function LineChart({ data }: LineChartProps) {
	return (
		<ResponsiveContainer width="100%" height={300}>
			<RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
				<CartesianGrid strokeDasharray="3 3" vertical={false} />
				<XAxis dataKey="date" />
				<YAxis allowDecimals={false} />
				<Tooltip
					content={({ active, payload, label }) => {
						if (active && payload && payload.length) {
							return (
								<Card className="border bg-white p-2 shadow-sm">
									<div className="text-sm font-medium">Fecha: {label}</div>
									<div className="text-sm">Cambios: {payload[0].value}</div>
								</Card>
							)
						}
						return null
					}}
				/>
				<Line
					type="monotone"
					dataKey="cambios"
					stroke="#2563eb"
					strokeWidth={2}
					dot={{ r: 4, fill: "#2563eb" }}
					activeDot={{ r: 6 }}
					name="Cambios"
				/>
			</RechartsLineChart>
		</ResponsiveContainer>
	)
}
