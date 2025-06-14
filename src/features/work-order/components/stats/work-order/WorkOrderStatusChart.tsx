"use client"

import { PieChart, Pie, Cell } from "recharts"
import { PieChartIcon } from "lucide-react"

import { WorkOrderStatsResponse } from "@/features/work-order/hooks/use-work-order-stats"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"
import {
	ChartLegend,
	ChartTooltip,
	ChartContainer,
	ChartLegendContent,
	ChartTooltipContent,
} from "@/shared/components/ui/chart"

interface WorkOrderStatusChartProps {
	data: WorkOrderStatsResponse
}

const COLORS = [
	"var(--color-orange-500)",
	"var(--color-yellow-500)",
	"var(--color-orange-600)",
	"var(--color-red-600)",
	"var(--color-orange-700)",
	"var(--color-red-700)",
]

export function WorkOrderStatusChart({ data }: WorkOrderStatusChartProps) {
	const statusData = data.charts.status

	return (
		<Card className="border-none">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-lg font-semibold">Distribución de Estados</CardTitle>
						<CardDescription>Órdenes de Trabajo dividas por estado</CardDescription>
					</div>
					<PieChartIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent>
				<ChartContainer
					className="h-[250px] w-full"
					config={{
						IN_PROGRESS: {
							label: "En Progreso",
						},
						COMPLETED: {
							label: "Completadas",
						},
						PENDING: {
							label: "Pendientes",
						},
						CANCELLED: {
							label: "Canceladas",
						},
						PLANNED: {
							label: "Planeadas",
						},
					}}
				>
					<PieChart>
						<Pie
							data={statusData}
							cx="50%"
							cy="50%"
							innerRadius={45}
							paddingAngle={5}
							dataKey="value"
							nameKey="name"
							label
						>
							{statusData.map((_, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Pie>
						<ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
						<ChartLegend content={<ChartLegendContent />} />
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
