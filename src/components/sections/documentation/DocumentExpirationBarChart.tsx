"use client"

import { useRouter } from "next/navigation";
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

interface DocumentExpirationBarChartProps {
	data: Array<{ name: string; value: number; fill?: string; id: string }>
	colors?: string[]
}

export function DocumentExpirationBarChart({ data, colors }: DocumentExpirationBarChartProps) {
	const router = useRouter()

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
							onClick={() => router.push(`/dashboard/documentacion/busqueda?expiration=${entry.id}`)}
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
		</ResponsiveContainer>
	)
}
