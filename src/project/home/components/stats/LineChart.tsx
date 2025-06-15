"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface LineChartProps {
	data: Array<{
		name: string
		value: number
		secondary?: number
	}>
	height?: number
}

export function CustomLineChart({ data, height = 300 }: LineChartProps) {
	return (
		<ResponsiveContainer width="100%" height={height}>
			<LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
				<XAxis dataKey="name" tick={{ fontSize: 12 }} />
				<YAxis tick={{ fontSize: 12 }} />
				<Tooltip />
				<Legend />
				<Line
					type="monotone"
					dataKey="value"
					stroke="#3b82f6"
					strokeWidth={3}
					dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
					name="Completadas"
				/>
				{data.some((item) => item.secondary !== undefined) && (
					<Line
						type="monotone"
						dataKey="secondary"
						stroke="#ef4444"
						strokeWidth={3}
						dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
						name="Pendientes"
					/>
				)}
			</LineChart>
		</ResponsiveContainer>
	)
}
