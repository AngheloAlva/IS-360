"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type { ChartConfig } from "@/shared/components/ui/chart"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"

interface WrResponseDataPoint {
	name: string
	avgHours: number
	count: number
}

interface WrResponseChartProps {
	data: Array<WrResponseDataPoint>
}

const chartConfig = {
	avgHours: { label: "Tiempo promedio", color: "var(--color-cyan-500)" },
} satisfies ChartConfig

export default function WrResponseChart({ data }: WrResponseChartProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Tiempo de Respuesta — Solicitudes</CardTitle>
				<CardDescription>Promedio mensual desde solicitud hasta apertura de OT</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-90 w-full">
					<AreaChart data={data}>
						<defs>
							<linearGradient id="fillResponse" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="var(--color-cyan-500)" stopOpacity={0.3} />
								<stop offset="95%" stopColor="var(--color-cyan-500)" stopOpacity={0.05} />
							</linearGradient>
						</defs>
						<CartesianGrid vertical={false} />
						<XAxis dataKey="name" tickLine={false} axisLine={false} />
						<YAxis tickFormatter={(v) => `${v}h`} />
						<ChartTooltip
							content={
								<ChartTooltipContent formatter={(value) => [`${value} horas`, "Tiempo promedio"]} />
							}
						/>
						<Area
							type="monotone"
							dataKey="avgHours"
							stroke="var(--color-cyan-500)"
							strokeWidth={2}
							fill="url(#fillResponse)"
							activeDot={{ r: 6, strokeWidth: 2 }}
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
