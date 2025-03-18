"use client"

import { getWorkBooksChartData } from "@/actions/work-books/admin/getWorkBooksChartData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { useState, useEffect } from "react"
import { Bar, BarChart, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"

const chartConfig = {
	total: {
		label: "Total",
		color: "#2563eb",
	},
	active: {
		label: "Planificados",
		color: "#60a5fa",
	},
	completed: {
		label: "Completados",
		color: "#10b981",
	},
} satisfies ChartConfig

type MonthlyData = {
	name: string
	total: number
	active: number
	completed: number
}

type StatusData = {
	name: string
	value: number
}

export default function WorkBooksCharts() {
	const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
	const [statusDistribution, setStatusDistribution] = useState<StatusData[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchWorkBooksChartData = async () => {
			try {
				const data = await getWorkBooksChartData()
				setMonthlyData(data.monthlyData)
				setStatusDistribution(data.statusDistribution)
			} catch (error) {
				console.error("Error fetching chart data:", error)
			} finally {
				setIsLoading(false)
			}
		}
		fetchWorkBooksChartData()
	}, [])

	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Libros por Mes</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-[400px]">
						{isLoading ? (
							<div className="flex h-full items-center justify-center">
								<div className="text-muted-foreground">Cargando datos...</div>
							</div>
						) : monthlyData.length === 0 ? (
							<div className="flex h-full items-center justify-center">
								<div className="text-muted-foreground">No hay datos disponibles</div>
							</div>
						) : (
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
										stroke="var(--color-total)"
										strokeWidth={2}
										activeDot={{ r: 8 }}
									/>
									<Line
										type="monotone"
										dataKey="active"
										stroke="var(--color-active)"
										strokeWidth={2}
										activeDot={{ r: 8 }}
									/>
									<Line
										type="monotone"
										dataKey="completed"
										stroke="var(--color-completed)"
										strokeWidth={2}
										activeDot={{ r: 8 }}
									/>
								</LineChart>
							</ChartContainer>
						)}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Distribución por Estado</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-[400px]">
						{isLoading ? (
							<div className="flex h-full items-center justify-center">
								<div className="text-muted-foreground">Cargando datos...</div>
							</div>
						) : statusDistribution.length === 0 ? (
							<div className="flex h-full items-center justify-center">
								<div className="text-muted-foreground">No hay datos disponibles</div>
							</div>
						) : (
							<ChartContainer config={chartConfig}>
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
									<Bar dataKey="value" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
								</BarChart>
							</ChartContainer>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
