"use client"

import { PieChart, Pie, Cell, Label } from "recharts"
import { PieChartIcon } from "lucide-react"

import {
	ChartLegend,
	ChartTooltip,
	ChartContainer,
	ChartLegendContent,
	ChartTooltipContent,
} from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

import type { BarChartItem } from "@/project/maintenance-plan/hooks/use-maintenance-plan-stats"

interface MaintenancePlanPriorityChartProps {
	data: BarChartItem[]
	total: number
}

export default function MaintenancePlanPriorityChart({
	data,
	total,
}: MaintenancePlanPriorityChartProps) {
	return (
		<Card className="border">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Tareas por Prioridad</CardTitle>
						<CardDescription>Distribución de las tareas según su prioridad</CardDescription>
					</div>
					<PieChartIcon className="text-muted-foreground h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<ChartContainer
					config={{
						HIGH: {
							label: "Alta",
						},
						MEDIUM: {
							label: "Media",
						},
						LOW: {
							label: "Baja",
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
							nameKey="priority"
							innerRadius={45}
							paddingAngle={3}
						>
							{data.map((item, index) => (
								<Cell key={`cell-${index}`} fill={item.fill} />
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
													className="fill-foreground text-2xl font-bold"
												>
													{total.toLocaleString()}
												</tspan>
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy || 0) + 24}
													className="fill-muted-foreground text-sm"
												>
													Total
												</tspan>
											</text>
										)
									}
								}}
							/>
						</Pie>
						<ChartTooltip content={<ChartTooltipContent />} />
						<ChartLegend content={<ChartLegendContent />} />
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
