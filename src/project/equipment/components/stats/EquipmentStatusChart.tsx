"use client"

import { Label, Pie, PieChart } from "recharts"
import { PieChartIcon } from "lucide-react"

import { EquipmentStatusData } from "@/project/equipment/hooks/use-equipment-stats"

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

interface EquipmentStatusChartProps {
	data: EquipmentStatusData[]
}

export default function EquipmentStatusChart({ data }: EquipmentStatusChartProps) {
	return (
		<Card className="border-none">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Equipos con Órdenes de Trabajo</CardTitle>
						<CardDescription>Equipos que tienen órdenes de trabajo relacionadas</CardDescription>
					</div>
					<PieChartIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<div className="h-[250px] w-full max-w-[90dvw] px-2">
					<ChartContainer
						config={{
							"Con OT": {
								label: "Con Órdenes de Trabajo",
							},
							"Sin OT": {
								label: "Sin Órdenes de Trabajo",
							},
						}}
						className="h-full w-full"
					>
						<PieChart>
							<ChartTooltip content={<ChartTooltipContent />} />
							<Pie
								data={data}
								cx="50%"
								cy="50%"
								fill="#8884d8"
								dataKey="count"
								innerRadius={45}
								paddingAngle={3}
								nameKey="status"
								label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
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
														className="fill-foreground text-2xl font-semibold"
													>
														{data.reduce((acc, item) => acc + item.count, 0)?.toLocaleString()}
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

							<ChartLegend
								content={<ChartLegendContent nameKey="status" />}
								className="flex-wrap gap-x-3 gap-y-1"
							/>
						</PieChart>
					</ChartContainer>
				</div>
			</CardContent>
		</Card>
	)
}
