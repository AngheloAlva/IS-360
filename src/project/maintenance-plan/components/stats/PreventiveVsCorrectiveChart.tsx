"use client"

import { Bar, CartesianGrid, ComposedChart, LabelList, Line, XAxis, YAxis } from "recharts"

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

interface PreventiveVsCorrectiveDataPoint {
	name: string
	month: string
	preventive: number
	corrective: number
	ratio: number
}

interface PreventiveVsCorrectiveChartProps {
	data: PreventiveVsCorrectiveDataPoint[]
}

const chartConfig = {
	preventive: { label: "Preventivo (hrs)", color: "var(--color-green-700)" },
	corrective: { label: "Correctivo (hrs)", color: "var(--color-red-600)" },
	ratio: { label: "Relación", color: "var(--color-gray-500)" },
} satisfies ChartConfig

export default function PreventiveVsCorrectiveChart({ data }: PreventiveVsCorrectiveChartProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Tiempo de Mantenimiento</CardTitle>
				<CardDescription>Preventivo vs Correctivo en horas por período</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-87.5 w-full">
					<ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
						<CartesianGrid vertical={false} strokeDasharray="3 3" />

						<XAxis dataKey="name" tickLine={false} axisLine={false} />
						<YAxis tickLine={false} axisLine={false} />
						<YAxis
							yAxisId="right"
							orientation="right"
							tickLine={false}
							axisLine={false}
							domain={[0, 100]}
							tickFormatter={(v) => `${v}%`}
						/>

						<ChartTooltip content={<ChartTooltipContent />} />
						<ChartLegend content={<ChartLegendContent />} />

						<Bar
							dataKey="preventive"
							name="Preventivo (hrs)"
							fill="var(--color-amber-600)"
							radius={[4, 4, 0, 0]}
						>
							<LabelList position="top" className="fill-foreground text-xs" />
						</Bar>

						<Bar
							dataKey="corrective"
							name="Correctivo (hrs)"
							fill="var(--color-red-600)"
							radius={[4, 4, 0, 0]}
						>
							<LabelList position="top" className="fill-foreground text-xs" />
						</Bar>

						<Line
							yAxisId="right"
							dataKey="ratio"
							name="Relación %"
							stroke="var(--color-yellow-500)"
							strokeWidth={2}
							dot={{ r: 3 }}
						/>
					</ComposedChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
