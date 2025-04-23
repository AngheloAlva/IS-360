"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface ActivityLineChartProps {
	data: {
		date: string
		archivos: number
		carpetas: number
	}[]
}

export function ActivityLineChart({ data }: ActivityLineChartProps) {
	return (
		<ResponsiveContainer width="100%" height={350}>
			<LineChart data={data}>
				<XAxis
					dataKey="date"
					stroke="#888888"
					fontSize={12}
					tickLine={false}
					axisLine={false}
				/>
				<YAxis
					stroke="#888888"
					fontSize={12}
					tickLine={false}
					axisLine={false}
					tickFormatter={(value) => `${value}`}
				/>
				<Tooltip />
				<Line
					type="monotone"
					dataKey="archivos"
					stroke="#2563eb"
					strokeWidth={2}
					activeDot={{ r: 4 }}
					name="Archivos"
				/>
				<Line
					type="monotone"
					dataKey="carpetas"
					stroke="#16a34a"
					strokeWidth={2}
					activeDot={{ r: 4 }}
					name="Carpetas"
				/>
			</LineChart>
		</ResponsiveContainer>
	)
}
