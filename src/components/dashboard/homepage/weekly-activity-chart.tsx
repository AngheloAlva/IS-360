import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"
import { TrendingUp } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
	ChartLegend,
	ChartTooltip,
	ChartContainer,
	ChartLegendContent,
	ChartTooltipContent,
} from "@/components/ui/chart"

import type { WeeklyActivityItem } from "@/hooks/dashboard/use-homepage-stats"

interface WeeklyActivityChartProps {
	data: WeeklyActivityItem[]
	isLoading: boolean
}

export function WeeklyActivityChart({ data, isLoading }: WeeklyActivityChartProps) {
	if (isLoading) {
		return <WeeklyActivityChartSkeleton />
	}

	return (
		<Card className="border-none">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Actividad Semanal</CardTitle>
					<CardDescription>Actividad por módulo esta semana</CardDescription>
				</div>
				<TrendingUp className="text-muted-foreground h-4 w-4" />
			</CardHeader>
			<CardContent className="py-0 pl-2">
				<div className="h-[250px] w-full">
					<ChartContainer
						config={{
							workOrders: {
								label: "Órdenes de trabajo",
							},
							permits: {
								label: "Permisos de trabajo",
							},
							maintenance: {
								label: "Planes de mantenimiento",
							},
						}}
						className="h-[250px] w-full"
					>
						<AreaChart data={data}>
							<CartesianGrid strokeDasharray="3 3" opacity={0.5} />
							<XAxis dataKey="day" />
							<YAxis />
							<ChartTooltip content={<ChartTooltipContent />} />
							<ChartLegend content={<ChartLegendContent />} />
							<defs>
								<linearGradient id="fillWorkOrders" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
									<stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillPermits" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#dc2626" stopOpacity={0.8} />
									<stop offset="95%" stopColor="#dc2626" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillMaintenance" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
									<stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
								</linearGradient>
							</defs>

							<Area
								type="monotone"
								dataKey="workOrders"
								stackId="1"
								stroke="#f97316"
								fill="url(#fillWorkOrders)"
								name="Órdenes"
							/>
							<Area
								type="monotone"
								dataKey="permits"
								stackId="1"
								stroke="#dc2626"
								fill="url(#fillPermits)"
								name="Permisos"
							/>
							<Area
								type="monotone"
								dataKey="maintenance"
								stackId="1"
								stroke="#6366f1"
								fill="url(#fillMaintenance)"
								name="Mantenimiento"
							/>
						</AreaChart>
					</ChartContainer>
				</div>
			</CardContent>
		</Card>
	)
}

function WeeklyActivityChartSkeleton() {
	return (
		<Card className="col-span-1 shadow-md">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<Skeleton className="mb-2 h-6 w-48" />
					<Skeleton className="h-4 w-36" />
				</div>
				<Skeleton className="h-4 w-4 rounded" />
			</CardHeader>
			<CardContent>
				<div className="h-[250px] w-full">
					<Skeleton className="h-full w-full rounded" />
				</div>
			</CardContent>
		</Card>
	)
}
