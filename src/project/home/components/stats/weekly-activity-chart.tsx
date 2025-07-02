import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"
import { TrendingUp } from "lucide-react"

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

import type { WeeklyActivityItem } from "@/project/home/hooks/use-homepage-stats"

interface WeeklyActivityChartProps {
	data: WeeklyActivityItem[]
	isLoading: boolean
}

export function WeeklyActivityChart({ data, isLoading }: WeeklyActivityChartProps) {
	if (isLoading) {
		return <WeeklyActivityChartSkeleton />
	}

	// Ejemplo de nueva estructura de datos:
	// [
	//   {
	//     "day": "Lunes",
	//     "workOrders": 3,
	//     "permits": 1,
	//     "maintenance": 0,
	//     "equipment": 2,
	//     "users": 0,
	//     "other": 0
	//   },
	//   ...
	// ]

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
				<div className="h-[250px] w-full max-w-[90dvw]">
					<ChartContainer
						config={{
							workOrders: { label: "Órdenes de trabajo" },
							permits: { label: "Permisos de trabajo" },
							maintenance: { label: "Planes de mantenimiento" },
							equipment: { label: "Equipos" },
							users: { label: "Usuarios" },
							other: { label: "Otros" },
						}}
						className="h-[250px] w-full max-w-[90dvw]"
					>
						<AreaChart data={data}>
							<ChartTooltip content={<ChartTooltipContent />} />

							<CartesianGrid strokeDasharray="3 3" opacity={0.5} />
							<XAxis dataKey="day" />
							<YAxis />

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
								<linearGradient id="fillEquipment" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
									<stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
									<stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillOther" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
									<stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
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
							<Area
								type="monotone"
								dataKey="equipment"
								stackId="1"
								stroke="#10b981"
								fill="url(#fillEquipment)"
								name="Equipos"
							/>
							<Area
								type="monotone"
								dataKey="users"
								stackId="1"
								stroke="#8b5cf6"
								fill="url(#fillUsers)"
								name="Usuarios"
							/>
							<Area
								type="monotone"
								dataKey="other"
								stackId="1"
								stroke="#0ea5e9"
								fill="url(#fillOther)"
								name="Otros"
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
				<div className="h-[250px] w-full max-w-[90dvw]">
					<Skeleton className="h-full w-full rounded" />
				</div>
			</CardContent>
		</Card>
	)
}
