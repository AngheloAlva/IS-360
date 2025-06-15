"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface BarChartProps {
	data: Array<{
		name: string
		value: number
		fill?: string
	}>
	height?: number
}

export function CustomBarChart({ data, height = 300 }: BarChartProps) {
	return (
		<ResponsiveContainer width="100%" height={height}>
			<BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
				<XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
				<YAxis tick={{ fontSize: 12 }} />
				<Tooltip />
				<Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
			</BarChart>
		</ResponsiveContainer>
	)
}
