import { PieChart as PieChartIcon } from "lucide-react"
import { PieChart, Pie, Cell, Label } from "recharts"

import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui/chart"
import { Skeleton } from "@/shared/components/ui/skeleton"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

import type { WorkOrderPieChartItem } from "@/project/home/hooks/use-homepage-stats"

interface WorkOrdersPieChartProps {
	data: WorkOrderPieChartItem[]
	isLoading: boolean
}

const STATUS_COLORS = {
	PLANNED: "var(--color-yellow-500)",
	PENDING: "var(--color-red-500)",
	IN_PROGRESS: "var(--color-orange-500)",
	COMPLETED: "var(--color-green-500)",
}

export function WorkOrdersPieChart({ data, isLoading }: WorkOrdersPieChartProps) {
	if (isLoading) {
		return <WorkOrdersPieChartSkeleton />
	}

	const totalWorkOrders = data.reduce((sum, item) => sum + item.value, 0)

	console.log(data)

	return (
		<Card className="border-none">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Órdenes de Trabajo</CardTitle>
					<CardDescription>Distribución por estado ({totalWorkOrders} total)</CardDescription>
				</div>
				<PieChartIcon className="text-muted-foreground h-4 w-4" />
			</CardHeader>
			<CardContent className="py-0">
				<div className="h-[350px] w-full max-w-[90dvw]">
					<ChartContainer
						config={{
							workOrders: {
								label: "Órdenes de Trabajo",
							},
							PLANNED: {
								label: "Planificadas",
							},
							PENDING: {
								label: "Pendientes",
							},
							IN_PROGRESS: {
								label: "En Progreso",
							},
							COMPLETED: {
								label: "Completadas",
							},
						}}
						className="h-full w-full"
					>
						<PieChart>
							<ChartTooltip
								content={
									<ChartTooltipContent
										formatter={(value, name) => [
											`${value} órdenes (${Math.round((Number(value) / totalWorkOrders) * 100)}%)`,
											name,
										]}
									/>
								}
							/>
							<Pie
								label
								cx="50%"
								cy="50%"
								data={data}
								nameKey="name"
								dataKey="value"
								innerRadius={60}
								paddingAngle={2}
							>
								{data.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={
											STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] ||
											"var(--color-gray-500)"
										}
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
														{totalWorkOrders}
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
				</div>
			</CardContent>
		</Card>
	)
}

function WorkOrdersPieChartSkeleton() {
	return (
		<Card className="border-none">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<Skeleton className="mb-2 h-6 w-48" />
					<Skeleton className="h-4 w-36" />
				</div>
				<Skeleton className="h-4 w-4 rounded" />
			</CardHeader>
			<CardContent>
				<div className="h-[350px] w-full max-w-[90dvw]">
					<Skeleton className="h-full w-full rounded" />
				</div>
			</CardContent>
		</Card>
	)
}
