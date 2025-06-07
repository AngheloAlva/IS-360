import { PieChart, Pie, Cell } from "recharts"
import { Activity } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
	ChartLegend,
	ChartTooltip,
	ChartContainer,
	ChartLegendContent,
	ChartTooltipContent,
} from "@/components/ui/chart"

import type { SystemHealthItem } from "@/hooks/dashboard/use-homepage-stats"

interface SystemHealthChartProps {
	data: SystemHealthItem[]
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
				<div className="h-[250px] w-full">
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
						className="h-[250px] w-full"
					>
						<PieChart>
							<Pie
								data={data}
								cx="50%"
								cy="50%"
								innerRadius={40}
								outerRadius={80}
								paddingAngle={2}
								dataKey="value"
								label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
							>
								{data.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} />
								))}
							</Pie>
							<ChartTooltip
								content={<ChartTooltipContent formatter={(value) => [`${value}%`, "Porcentaje"]} />}
							/>
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
				<div className="flex h-[250px] w-full items-center justify-center">
					<Skeleton className="h-[160px] w-[160px] rounded-full" />
				</div>
			</CardContent>
		</Card>
	)
}
