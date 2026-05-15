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
				<div className="h-[350px] w-full max-w-[90dvw]">
					<ChartContainer
						config={{
							workOrders: { label: "Órdenes de trabajo" },
							permits: { label: "Permisos de trabajo" },
							maintenance: { label: "Planes de mantenimiento" },
							equipment: { label: "Equipos" },
							users: { label: "Usuarios" },
							companies: { label: "Empresas" },
							workRequests: { label: "Solicitudes de trabajo" },
							documentation: { label: "Documentación" },
							vehicles: { label: "Vehículos" },
							startupFolders: { label: "Carpeta de arranque" },
						}}
						className="h-[350px] w-full max-w-[90dvw]"
					>
						<AreaChart data={data}>
							<ChartTooltip content={<ChartTooltipContent />} />

							<CartesianGrid strokeDasharray="3 3" opacity={0.5} />
							<XAxis dataKey="day" />
							<YAxis />

							<ChartLegend className="flex-wrap" content={<ChartLegendContent />} />
							<defs>
								<linearGradient id="fillWorkOrders" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-orange-500)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--color-orange-500)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillPermits" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-purple-500)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--color-purple-500)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillMaintenance" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-indigo-500)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--color-indigo-500)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillEquipment" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-emerald-500)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--color-emerald-500)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-purple-500)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--color-purple-500)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillCompanies" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-blue-500)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--color-blue-500)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillWorkRequests" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-cyan-500)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--color-cyan-500)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillDocumentation" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-amber-500)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--color-amber-500)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillVehicles" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-green-500)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--color-green-500)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillStartupFolders" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-teal-500)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--color-teal-500)" stopOpacity={0.1} />
								</linearGradient>
							</defs>

							<Area
								type="monotone"
								dataKey="workOrders"
								stackId="1"
								stroke="var(--color-orange-500)"
								fill="url(#fillWorkOrders)"
								name="Órdenes"
							/>
							<Area
								type="monotone"
								dataKey="permits"
								stackId="1"
								stroke="var(--color-purple-500)"
								fill="url(#fillPermits)"
								name="Permisos"
							/>
							<Area
								type="monotone"
								dataKey="maintenance"
								stackId="1"
								stroke="var(--color-indigo-500)"
								fill="url(#fillMaintenance)"
								name="Mantenimiento"
							/>
							<Area
								type="monotone"
								dataKey="equipment"
								stackId="2"
								stroke="var(--color-emerald-500)"
								fill="url(#fillEquipment)"
								name="Equipos"
							/>
							<Area
								type="monotone"
								dataKey="users"
								stackId="3"
								stroke="var(--color-purple-500)"
								fill="url(#fillUsers)"
								name="Usuarios"
							/>
							<Area
								type="monotone"
								dataKey="companies"
								stackId="4"
								stroke="var(--color-blue-500)"
								fill="url(#fillCompanies)"
								name="Empresas"
							/>
							<Area
								type="monotone"
								dataKey="workRequests"
								stackId="5"
								stroke="var(--color-cyan-500)"
								fill="url(#fillWorkRequests)"
								name="Solicitudes"
							/>
							<Area
								type="monotone"
								dataKey="vehicles"
								stackId="6"
								stroke="var(--color-green-500)"
								fill="url(#fillVehicles)"
								name="Vehículos"
							/>
							<Area
								type="monotone"
								dataKey="startupFolders"
								stackId="7"
								stroke="var(--color-teal-500)"
								fill="url(#fillStartupFolders)"
								name="Carpetas de arranque"
							/>
							<Area
								type="monotone"
								dataKey="documentation"
								stackId="8"
								stroke="var(--color-amber-500)"
								fill="url(#fillDocumentation)"
								name="Documentación"
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
				<div className="h-[350px] w-full max-w-[90dvw]">
					<Skeleton className="h-full w-full rounded" />
				</div>
			</CardContent>
		</Card>
	)
}
