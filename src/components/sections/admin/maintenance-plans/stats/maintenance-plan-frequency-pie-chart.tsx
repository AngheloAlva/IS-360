"use client"

import { PieChart, Pie, Cell, Label } from "recharts"

import { PieChartItem } from "@/hooks/maintenance-plans/use-maintenance-plan-stats"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	ChartLegend,
	ChartTooltip,
	ChartContainer,
	ChartLegendContent,
	ChartTooltipContent,
} from "@/components/ui/chart"

interface MaintenancePlanFrequencyPieChartProps {
	data: PieChartItem[]
	total: number
}

const COLORS = [
	"var(--color-indigo-500)",
	"var(--color-purple-500)",
	"var(--color-rose-500)",
	"var(--color-violet-500)",
	"var(--color-fuchsia-500)",
	"var(--color-pink-500)",
	"var(--color-cyan-500)",
	"var(--color-cyan-500)",
]

export default function MaintenancePlanFrequencyPieChart({
	data,
	total,
}: MaintenancePlanFrequencyPieChartProps) {
	return (
		<Card className="border">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg">Distribución por Frecuencia</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<ChartContainer
					config={{
						Diario: {
							label: "Diario",
						},
						Semanal: {
							label: "Semanal",
						},
						Mensual: {
							label: "Mensual",
						},
						Anual: {
							label: "Anual",
						},
					}}
					className="h-[250px] w-full"
				>
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={45}
							label={(props) => `${props.percent.toFixed(1)}%`}
							dataKey="value"
							nameKey="name"
							paddingAngle={5}
						>
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
													{total.toLocaleString()}
												</tspan>
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy || 0) + 24}
													className="fill-muted-foreground"
												>
													Planes
												</tspan>
											</text>
										)
									}
								}}
							/>

							{data.map((_, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Pie>
						<ChartTooltip content={<ChartTooltipContent />} />
						<ChartLegend content={<ChartLegendContent />} />
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
