"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartSplineIcon } from "lucide-react"

import { ChartContainer, ChartTooltip } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

interface SafetyTalkMonthlyTrendChartProps {
	data: Array<{
		name: string
		value: number
	}>
}

export function SafetyTalkMonthlyTrendChart({ data }: SafetyTalkMonthlyTrendChartProps) {
	return (
		<Card className="border-none">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Tendencia Mensual</CardTitle>
						<CardDescription>Charlas completadas por mes en los últimos 6 meses</CardDescription>
					</div>
					<ChartSplineIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="px-0">
				<ChartContainer config={{}} className="h-[250px] w-full">
					<AreaChart data={data} margin={{ bottom: 20, top: 10, right: 15 }}>
						<CartesianGrid strokeDasharray="3 3" opacity={0.5} />
						<XAxis angle={-25} dataKey="name" textAnchor="end" />
						<YAxis />
						<ChartTooltip />

						<defs>
							<linearGradient id="fillTrend" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="var(--color-emerald-500)" stopOpacity={0.8} />
								<stop offset="95%" stopColor="var(--color-emerald-500)" stopOpacity={0.1} />
							</linearGradient>
						</defs>

						<Area
							type="monotone"
							dataKey="value"
							stroke="var(--color-emerald-500)"
							strokeWidth={2}
							dot={false}
							name="Charlas"
							fill="url(#fillTrend)"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
