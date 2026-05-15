"use client"

import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts"

import type { ChartConfig } from "@/shared/components/ui/chart"
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui/chart"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"

import type { BacklogChartPoint } from "@/project/maintenance-plan/types/kpi"

interface BacklogChartProps {
	data: BacklogChartPoint[]
}

const chartConfig = {
	pendientes: { label: "Pendientes", color: "var(--color-amber-500)" },
	enProgreso: { label: "En progreso", color: "var(--color-sky-500)" },
	completadas: { label: "Completadas", color: "var(--color-green-500)" },
	backlog: { label: "Backlog", color: "var(--color-blue-600)" },
} satisfies ChartConfig

export default function BacklogChart({ data }: BacklogChartProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Backlog de Mantenimiento</CardTitle>
				<CardDescription>HH pendientes atrasadas / Tiempo de respuesta</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-87.5 w-full">
					<ComposedChart data={data}>
						<CartesianGrid vertical={false} strokeDasharray="3 3" />

						<XAxis dataKey="name" tickLine={false} axisLine={false} />
						<YAxis tickLine={false} axisLine={false} />
						<YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} />

						<ChartTooltip content={<ChartTooltipContent />} />
						<ChartLegend content={<ChartLegendContent />} />

						<Bar
							dataKey="pendientes"
							name="Pendientes"
							fill="var(--color-amber-500)"
							radius={[4, 4, 0, 0]}
						/>
						<Bar
							dataKey="enProgreso"
							name="En progreso"
							fill="var(--color-sky-500)"
							radius={[4, 4, 0, 0]}
						/>
						<Bar
							dataKey="completadas"
							name="Completadas"
							fill="var(--color-green-500)"
							radius={[4, 4, 0, 0]}
						/>

						<Line
							yAxisId="right"
							dataKey="backlog"
							name="Backlog"
							stroke="var(--color-blue-600)"
							strokeWidth={2}
							dot={{ r: 4, fill: "var(--color-blue-600)" }}
						/>
					</ComposedChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
