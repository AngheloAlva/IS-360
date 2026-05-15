import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"
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

import type { ModuleActivityAreaChartItem } from "@/project/home/hooks/use-homepage-stats"

interface ModuleActivityAreaChartProps {
	data: ModuleActivityAreaChartItem[]
	isLoading: boolean
}

export function ModuleActivityAreaChart({ data, isLoading }: ModuleActivityAreaChartProps) {
	if (isLoading) {
		return <ModuleActivityAreaChartSkeleton />
	}

	return (
		<Card className="border-none">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Actividad por Módulo</CardTitle>
					<CardDescription>Interacciones registradas por módulo - últimos 30 días</CardDescription>
				</div>
				<Activity className="text-muted-foreground h-4 w-4" />
			</CardHeader>
			<CardContent className="py-0 pl-2">
				<div className="h-[350px] w-full max-w-[90dvw]">
					<ChartContainer
						config={{
							workOrders: {
								label: "Órdenes de Trabajo",
								color: "var(--chart-1)",
							},
							workPermits: {
								label: "Permisos de Trabajo",
								color: "var(--chart-2)",
							},
							maintenance: {
								label: "Mantenimiento",
								color: "var(--chart-3)",
							},
							equipment: {
								label: "Equipos",
								color: "var(--chart-4)",
							},
							startupFolders: {
								label: "Carpetas de Arranque",
								color: "var(--chart-5)",
							},
							safetyTalk: {
								label: "Charlas de Seguridad",
								color: "var(--chart-6)",
							},
							lockoutPermits: {
								label: "Permisos de Bloqueo",
								color: "var(--chart-7)",
							},
							documentation: {
								label: "Documentación",
								color: "var(--chart-8)",
							},
							workRequests: {
								label: "Solicitudes de Trabajo",
								color: "var(--chart-9)",
							},
							company: {
								label: "Empresas",
								color: "var(--chart-10)",
							},
							users: {
								label: "Usuarios",
								color: "var(--chart-11)",
							},
							laborControlFolders: {
								label: "Control Laboral",
								color: "var(--chart-12)",
							},
						}}
						className="h-[350px] w-full max-w-[90dvw]"
					>
						<AreaChart data={data}>
							<ChartTooltip
								content={
									<ChartTooltipContent
										formatter={(value, name) => {
											const labels: Record<string, string> = {
												workOrders: "Órdenes de Trabajo",
												workPermits: "Permisos de Trabajo",
												maintenance: "Mantenimiento",
												equipment: "Equipos",
												startupFolders: "Carpetas de Arranque",
												safetyTalk: "Charlas de Seguridad",
												lockoutPermits: "Permisos de Bloqueo",
												documentation: "Documentación",
												workRequests: "Solicitudes de Trabajo",
												company: "Empresas",
												users: "Usuarios",
												laborControlFolders: "Control Laboral",
											}
											return [`${value} interacciones en ${labels[name as string] || name}`]
										}}
									/>
								}
							/>

							<CartesianGrid strokeDasharray="3 3" opacity={0.5} />
							<XAxis dataKey="date" />
							<YAxis />

							<ChartLegend className="flex-wrap" content={<ChartLegendContent />} />
							<defs>
								<linearGradient id="fillWorkOrders" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillWorkPermits" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillMaintenance" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillEquipment" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--chart-4)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillStartupFolders" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--chart-5)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--chart-5)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillSafetyTalk" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--chart-6)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--chart-6)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillLockoutPermits" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--chart-7)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--chart-7)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillDocumentation" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--chart-8)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--chart-8)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillWorkRequests" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--chart-9)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--chart-9)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillCompany" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--chart-10)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--chart-10)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--chart-11)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--chart-11)" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="fillLaborControlFolders" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--chart-12)" stopOpacity={0.8} />
									<stop offset="95%" stopColor="var(--chart-12)" stopOpacity={0.1} />
								</linearGradient>
							</defs>

							<Area
								type="monotone"
								dataKey="workOrders"
								stroke="var(--chart-1)"
								fill="url(#fillWorkOrders)"
								strokeWidth={2}
							/>
							<Area
								type="monotone"
								dataKey="workPermits"
								stroke="var(--chart-2)"
								fill="url(#fillWorkPermits)"
								strokeWidth={2}
							/>
							<Area
								type="monotone"
								dataKey="maintenance"
								stroke="var(--chart-3)"
								fill="url(#fillMaintenance)"
								strokeWidth={2}
							/>
							<Area
								type="monotone"
								dataKey="equipment"
								stroke="var(--chart-4)"
								fill="url(#fillEquipment)"
								strokeWidth={2}
							/>
							<Area
								type="monotone"
								dataKey="startupFolders"
								stroke="var(--chart-5)"
								fill="url(#fillStartupFolders)"
								strokeWidth={2}
							/>
							<Area
								type="monotone"
								dataKey="safetyTalk"
								stroke="var(--chart-5)"
								fill="url(#fillSafetyTalk)"
								strokeWidth={2}
							/>
							<Area
								type="monotone"
								dataKey="lockoutPermits"
								stroke="var(--chart-5)"
								fill="url(#fillLockoutPermits)"
								strokeWidth={2}
							/>
							<Area
								type="monotone"
								dataKey="documentation"
								stroke="var(--chart-5)"
								fill="url(#fillDocumentation)"
								strokeWidth={2}
							/>
							<Area
								type="monotone"
								dataKey="workRequests"
								stroke="var(--chart-5)"
								fill="url(#fillWorkRequests)"
								strokeWidth={2}
							/>
							<Area
								type="monotone"
								dataKey="company"
								stroke="var(--chart-5)"
								fill="url(#fillCompany)"
								strokeWidth={2}
							/>
							<Area
								type="monotone"
								dataKey="users"
								stroke="var(--chart-5)"
								fill="url(#fillUsers)"
								strokeWidth={2}
							/>
							<Area
								type="monotone"
								dataKey="laborControlFolders"
								stroke="var(--chart-5)"
								fill="url(#fillLaborControlFolders)"
								strokeWidth={2}
							/>
						</AreaChart>
					</ChartContainer>
				</div>
			</CardContent>
		</Card>
	)
}

function ModuleActivityAreaChartSkeleton() {
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
