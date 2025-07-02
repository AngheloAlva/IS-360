"use client"

import { PieChart, Pie, Label } from "recharts"
import { PieChartIcon } from "lucide-react"

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

interface WorkPermitStatusChartProps {
	data: {
		status: string
		count: number
		fill: string
	}[]
	total: number
}

export default function WorkPermitStatusChart({ data, total }: WorkPermitStatusChartProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-base font-medium">Estado de Permisos de Trabajo</CardTitle>
						<CardDescription>Estado de permisos de trabajo agrupados por estado</CardDescription>
					</div>
					<PieChartIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<ChartContainer
					config={{
						ACTIVE: {
							label: "Activo",
						},
						IN_PROGRESS: {
							label: "En Progreso",
						},
						COMPLETED: {
							label: "Completado",
						},
						CANCELLED: {
							label: "Cancelado",
						},
						EXPIRED: {
							label: "Expirado",
						},
					}}
					className="h-[250px] w-full max-w-[90dvw]"
				>
					<PieChart>
						<ChartTooltip content={<ChartTooltipContent nameKey="status" />} />

						<Pie
							label
							cx="50%"
							cy="50%"
							data={data}
							dataKey="count"
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
													className="fill-foreground text-2xl font-semibold"
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

						<ChartLegend content={<ChartLegendContent nameKey="status" />} />
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
