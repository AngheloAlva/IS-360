"use client"

import { getWorkPermitsChartData } from "@/actions/work-permit/admin/getWorkPermitsChartData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { useState, useEffect } from "react"
import {
	Bar,
	BarChart,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"

const chartConfig = {
	desktop: {
		label: "Desktop",
		color: "#2563eb",
	},
	mobile: {
		label: "Mobile",
		color: "#60a5fa",
	},
} satisfies ChartConfig

export default function WorkPermitsCharts() {
	const [monthlyData, setMonthlyData] = useState<
		Array<{
			name: string
			total: number
			active: number
			completed: number
		}>
	>([])
	const [statusDistribution, setStatusDistribution] = useState<
		Array<{
			name: string
			value: number
		}>
	>([])

	useEffect(() => {
		const fetchWorkPermitsChartData = async () => {
			const { monthlyData, statusDistribution } = await getWorkPermitsChartData()
			setMonthlyData(monthlyData)
			setStatusDistribution(statusDistribution)
		}
		fetchWorkPermitsChartData()
	}, [])

	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Permisos por Mes</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-[400px]">
						<ChartContainer config={chartConfig}>
							<LineChart data={monthlyData}>
								<XAxis
									dataKey="name"
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
									dataKey="total"
									stroke="var(--chart-1)"
									strokeWidth={2}
									activeDot={{ r: 8 }}
								/>
								<Line
									type="monotone"
									dataKey="active"
									stroke="var(--chart-2)"
									strokeWidth={2}
									activeDot={{ r: 8 }}
								/>
								<Line
									type="monotone"
									dataKey="completed"
									stroke="var(--chart-3)"
									strokeWidth={2}
									activeDot={{ r: 8 }}
								/>
							</LineChart>
						</ChartContainer>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Distribución por Estado</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-[400px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={statusDistribution}>
								<XAxis
									dataKey="name"
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
								<Bar dataKey="value" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
