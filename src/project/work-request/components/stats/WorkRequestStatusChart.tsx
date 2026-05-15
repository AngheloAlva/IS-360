"use client"

import { useState } from "react"
import { Cell, Label, Pie, PieChart } from "recharts"
import { PieChartIcon } from "lucide-react"

import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"
import { ChartTooltip, ChartContainer, ChartTooltipContent } from "@/shared/components/ui/chart"

interface WorkRequestStatusChartProps {
	data: {
		status: string
		count: number
		fill: string
	}[]
}

export default function WorkRequestStatusChart({ data }: WorkRequestStatusChartProps) {
	const [hoveredStatus, setHoveredStatus] = useState<string | null>(null)
	const total = data.reduce((acc, item) => acc + item.count, 0)

	const chartItems = data
		.filter((item) => item.count > 0)
		.map((item) => ({
			...item,
			percentage: total === 0 ? 0 : (item.count / total) * 100,
		}))

	return (
		<Card className="border-none">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Estado de Solicitud de Trabajo</CardTitle>
						<CardDescription>Solicitudes de trabajo divididas por su estado</CardDescription>
					</div>
					<div className="rounded-lg bg-emerald-500/10 p-1.5">
						<PieChartIcon className="size-5 text-emerald-500" />
					</div>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<div className="flex h-[250px] w-full flex-col items-center justify-center gap-6 px-2 md:h-auto md:flex-row md:items-center md:justify-between">
					<ChartContainer
						config={{
							Atendidas: {
								label: "Atendidas",
							},
							Canceladas: {
								label: "Canceladas",
							},
							Pendientes: {
								label: "Pendientes",
							},
						}}
						className="h-full w-full md:max-w-72"
					>
						<PieChart>
							<ChartTooltip content={<ChartTooltipContent />} />
							<Pie
								data={chartItems}
								cx="50%"
								cy="50%"
								dataKey="count"
								innerRadius={45}
								nameKey="status"
								paddingAngle={3}
								onMouseLeave={() => setHoveredStatus(null)}
							>
								{chartItems.map((item) => (
									<Cell
										key={`cell-${item.status}`}
										fill={item.fill}
										fillOpacity={hoveredStatus && hoveredStatus !== item.status ? 0.25 : 1}
										stroke={
											hoveredStatus === item.status ? "var(--color-background)" : "transparent"
										}
										strokeWidth={hoveredStatus === item.status ? 2 : 0}
										onMouseEnter={() => setHoveredStatus(item.status)}
										onMouseLeave={() => setHoveredStatus(null)}
									/>
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
														className="fill-foreground text-2xl font-semibold"
													>
														{total.toLocaleString("es-CL")}
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
						</PieChart>
					</ChartContainer>

					<div className="w-full md:max-w-[300px]">
						{chartItems.map((item) => (
							<div
								key={item.status}
								className="flex items-center justify-between gap-4 rounded-md px-2 py-2 transition-opacity"
								style={{ opacity: hoveredStatus && hoveredStatus !== item.status ? 0.35 : 1 }}
								onMouseEnter={() => setHoveredStatus(item.status)}
								onMouseLeave={() => setHoveredStatus(null)}
							>
								<div className="flex min-w-0 items-center gap-2">
									<span
										className="h-2.5 w-2.5 shrink-0 rounded-full"
										style={{ backgroundColor: item.fill }}
									/>
									<p className="truncate text-sm font-medium">{item.status}</p>
								</div>

								<p className="text-muted-foreground shrink-0 text-sm">
									{item.count.toLocaleString("es-CL")} ({item.percentage.toFixed(1)}%)
								</p>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
