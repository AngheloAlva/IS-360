"use client"

import { Cell, Label, Pie, PieChart } from "recharts"

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
import { useKpiDrillDownStore } from "@/project/maintenance-plan/stores/kpi-drill-down.store"
import type { DrillDownSegment } from "@/project/maintenance-plan/types/kpi-drill-down"

interface OnTimeChartDataPoint {
	name: string
	value: number
	fill: string
}

interface OnTimeChartProps {
	data: Array<OnTimeChartDataPoint>
	onTimePercent: number
}

const chartConfig = {
	"value": { label: "OTs" },
	"En fecha": { label: "En fecha", color: "var(--color-green-500)" },
	"Atrasadas": { label: "Atrasadas", color: "var(--color-red-500)" },
} satisfies ChartConfig

// ─── Segment mapping ──────────────────────────────────────────────────────────

function nameToSegment(name: string): DrillDownSegment | null {
	if (name === "Atrasadas") return "on-time:late"
	if (name === "En fecha") return "on-time:ontime"
	return null
}

export default function OnTimeChart({ data, onTimePercent }: OnTimeChartProps) {
	const openDrillDown = useKpiDrillDownStore((s) => s.openDrillDown)

	return (
		<Card>
			<CardHeader>
				<CardTitle>OTs en Fecha vs Atrasadas</CardTitle>
				<CardDescription>Órdenes completadas dentro del plazo estimado</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-75">
					<PieChart>
						<Pie
							data={data}
							dataKey="value"
							nameKey="name"
							cornerRadius={8}
							innerRadius={60}
							strokeWidth={5}
							paddingAngle={2}
							cursor="pointer"
							onClick={(entry) => {
								// entry.name is available from the data payload
								const segment = nameToSegment(entry?.name as string)
								if (segment) openDrillDown(segment)
							}}
						>
							{data.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={entry.fill} />
							))}
							<Label
								content={({ viewBox }) => {
									if (viewBox && "cx" in viewBox && "cy" in viewBox) {
										return (
											<text
												x={viewBox.cx}
												y={viewBox.cy}
												textAnchor="middle"
												dominantBaseline="middle"
											>
												<tspan
													x={viewBox.cx}
													y={viewBox.cy}
													className="fill-foreground text-3xl font-bold"
												>
													{onTimePercent}%
												</tspan>
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy || 0) + 24}
													className="fill-muted-foreground text-sm"
												>
													En fecha
												</tspan>
											</text>
										)
									}
								}}
							/>
						</Pie>
						<ChartTooltip content={<ChartTooltipContent />} />
						<ChartLegend content={<ChartLegendContent nameKey="name" />} />
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
