"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface DonutChartProps {
	data: Array<{
		name: string
		value: number
		fill: string
	}>
	height?: number
}

export function DonutChart({ data, height = 300 }: DonutChartProps) {
	const total = data.reduce((sum, item) => sum + item.value, 0)

	return (
		<ResponsiveContainer width="100%" height={height}>
			<PieChart>
				<Pie
					data={data}
					cx="50%"
					cy="50%"
					innerRadius={60}
					outerRadius={100}
					paddingAngle={2}
					dataKey="value"
				>
					{data.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={entry.fill} />
					))}
				</Pie>
				<Tooltip
					formatter={(value: number) => [
						`${value} (${((value / total) * 100).toFixed(1)}%)`,
						"Cantidad",
					]}
				/>
				<Legend />
			</PieChart>
		</ResponsiveContainer>
	)
}
