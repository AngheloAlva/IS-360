"use client"

import { PieChart, Pie, Cell, Label } from "recharts"
import { PieChartIcon } from "lucide-react"

import { PieChartItem } from "@/project/maintenance-plan/hooks/use-maintenance-plan-stats"

import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"
import {
	ChartLegend,
	ChartTooltip,
	ChartContainer,
	ChartLegendContent,
	ChartTooltipContent,
} from "@/shared/components/ui/chart"

interface MaintenancePlanFrequencyChartProps {
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

export default function MaintenancePlanFrequencyChart({
	data,
	total,
}: MaintenancePlanFrequencyChartProps) {
	console.log(data)
	return (
		<Card className="border">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Tareas por Frecuencia</CardTitle>
						<CardDescription>Distribución de las tareas por frecuencia</CardDescription>
					</div>
					<PieChartIcon className="text-muted-foreground h-5 min-w-5" />
				</div>
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
						Trimestral: {
							label: "Trimestral",
						},
						Semestral: {
							label: "Semestral",
						},
					}}
					className="h-[250px] w-full max-w-[90dvw]"
				>
					<PieChart>
						<Pie
							label
							cx="50%"
							cy="50%"
							data={data}
							dataKey="value"
							nameKey="name"
							innerRadius={45}
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
