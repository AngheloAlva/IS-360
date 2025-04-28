"use client"

import { Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

import { Card } from "@/components/ui/card"

interface PieChartProps {
	data: Array<{ name: string; value: number; fill?: string }>
	colors?: string[]
}

export function PieChart({ data, colors }: PieChartProps) {
	const filteredData = data.filter((item) => item.value > 0)
	const total = filteredData.reduce((acc, item) => acc + item.value, 0)

	return (
		<ResponsiveContainer width="100%" height={300}>
			<RechartsPieChart>
				<Pie
					cx="50%"
					cy="45%"
					fill="#8884d8"
					nameKey="name"
					dataKey="value"
					outerRadius={80}
					data={filteredData}
				>
					{filteredData.map((entry, index) => (
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
				</Pie>

				<Legend
					lang="es"

					align="center"
					layout="horizontal"
					className="text-sm"
					verticalAlign="bottom"
				/>

				<Tooltip
					content={({ active, payload }) => {
						if (active && payload && payload.length) {
							return (
								<Card className="bg-background flex flex-col gap-1 rounded-sm border px-3 py-2 shadow-sm">
									<div className="text-base font-semibold">{payload[0].payload.name}</div>
									<div className="text-sm">Cantidad: {payload[0].value}</div>
									<div className="text-sm">Porcentaje: {(((payload[0].value as number) / total) * 100).toFixed(2)}%</div>
								</Card>
							)
						}
						return null
					}}
				/>
			</RechartsPieChart>
		</ResponsiveContainer>
	)
}
