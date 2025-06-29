"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { ChartColumnIcon } from "lucide-react"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"
import {
	ChartConfig,
	ChartLegend,
	ChartTooltip,
	ChartContainer,
	ChartLegendContent,
	ChartTooltipContent,
} from "@/shared/components/ui/chart"

import type { WorkOrderStatusData } from "@/project/company/hooks/use-company-stats"

interface WorkOrderStatusChartProps {
	data: WorkOrderStatusData[]
}

const config = {
	planned: {
		label: "Planificadas",
		color: "var(--color-blue-500)",
	},
	inProgress: {
		label: "En Progreso",
		color: "var(--color-indigo-500)",
	},
	completed: {
		label: "Completadas",
		color: "var(--color-green-500)",
	},
	cancelled: {
		label: "Canceladas",
		color: "var(--color-red-500)",
	},
} satisfies ChartConfig

export function WorkOrderStatusChart({ data }: WorkOrderStatusChartProps) {
	// Preparar los datos para la visualización
	const chartData = data.map((item) => ({
		company: item.company.length > 12 ? `${item.company.substring(0, 12)}...` : item.company,
		planned: item.planned,
		inProgress: item.inProgress,
		completed: item.completed,
		cancelled: item.cancelled,
		fullName: item.company, // Para mostrar en el tooltip
		total: item.planned + item.inProgress + item.cancelled + item.completed,
	}))

	return (
		<Card className="shadow-md">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Órdenes de Trabajo por Estado</CardTitle>
						<CardDescription>Distribución según estado de OT por empresa</CardDescription>
					</div>
					<ChartColumnIcon className="text-muted-foreground h-5 min-w-5" />
				</div>
			</CardHeader>

			<CardContent className="max-w-[90dvw] p-0">
				<ChartContainer config={config} className="h-[350px] w-full">
					<BarChart data={chartData} margin={{ top: 10, left: 15, right: 15 }} barSize={20}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis
							dataKey="company"
							tickLine={false}
							axisLine={false}
							angle={-25}
							textAnchor="end"
							height={70}
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							label={{
								value: "Cantidad",
								angle: -90,
								position: "insideLeft",
								className: "fill-muted-foreground text-xs",
							}}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									labelFormatter={(label) => {
										// Encuentra el item original para obtener el nombre completo
										const item = chartData.find((d) => d.company === label)
										return item?.fullName || label
									}}
								/>
							}
						/>
						<ChartLegend className="flex-wrap gap-y-1" content={<ChartLegendContent />} />

						<Bar
							dataKey="planned"
							fill="var(--color-blue-500)"
							name="Planificadas"
							stackId="stack"
							radius={[0, 0, 4, 4]}
						/>
						<Bar
							dataKey="inProgress"
							fill="var(--color-indigo-500)"
							name="En Progreso"
							stackId="stack"
						/>
						<Bar
							dataKey="completed"
							fill="var(--color-green-500)"
							name="Completadas"
							stackId="stack"
						/>
						<Bar
							dataKey="cancelled"
							fill="var(--color-red-500)"
							name="Canceladas"
							stackId="stack"
							radius={[4, 4, 0, 0]}
						>
							<LabelList dataKey="total" position="top" />
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
