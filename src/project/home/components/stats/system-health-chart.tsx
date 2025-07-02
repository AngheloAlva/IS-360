import { PieChart, Pie, Cell } from "recharts"
import { Activity } from "lucide-react"

import { Skeleton } from "@/shared/components/ui/skeleton"
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

import type { ShapeChartItem } from "@/project/home/hooks/use-homepage-stats"

interface SystemHealthChartProps {
	data: ShapeChartItem[]
	isLoading: boolean
}

export function SystemHealthChart({ data, isLoading }: SystemHealthChartProps) {
	if (isLoading) {
		return <SystemHealthChartSkeleton />
	}

	return (
		<Card className="border-none">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Estado General del Sistema</CardTitle>
					<CardDescription>Salud operacional global</CardDescription>
				</div>
				<Activity className="text-muted-foreground h-4 w-4" />
			</CardHeader>
			<CardContent className="flex justify-center">
				<div className="h-[250px] w-full max-w-[90dvw]">
					<ChartContainer
						config={{
							Saludable: {
								label: "Saludable",
							},
							Atención: {
								label: "Atención",
							},
							Crítico: {
								label: "Crítico",
							},
						}}
						className="h-[250px] w-full max-w-[90dvw]"
					>
						<PieChart>
							<ChartTooltip
								content={<ChartTooltipContent formatter={(value) => [value, "Valor"]} />}
							/>

							<Pie
								data={data}
								cx="50%"
								cy="50%"
								innerRadius={40}
								outerRadius={80}
								paddingAngle={2}
								dataKey="value"
								label={({ label }) => `${label}`}
							>
								{data.map((_, index) => {
									// Asignar colores según el índice
									const colors = ["#10b981", "#f59e0b", "#0ea5e9", "#8b5cf6", "#ef4444"]
									return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
								})}
							</Pie>
							<ChartLegend content={<ChartLegendContent />} />
						</PieChart>
					</ChartContainer>
				</div>
			</CardContent>
		</Card>
	)
}

function SystemHealthChartSkeleton() {
	return (
		<Card className="col-span-1 shadow-md">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<Skeleton className="mb-2 h-6 w-48" />
					<Skeleton className="h-4 w-36" />
				</div>
				<Skeleton className="h-4 w-4 rounded" />
			</CardHeader>
			<CardContent className="flex justify-center">
				<div className="flex h-[250px] w-full max-w-[90dvw] items-center justify-center">
					<Skeleton className="h-[160px] w-[160px] rounded-full" />
				</div>
			</CardContent>
		</Card>
	)
}
