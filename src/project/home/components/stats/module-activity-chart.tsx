import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid } from "recharts"
import { BarChart3 } from "lucide-react"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import { Skeleton } from "@/shared/components/ui/skeleton"

import type { ModuleActivityItem } from "@/project/home/hooks/use-homepage-stats"

interface ModuleActivityChartProps {
	data: ModuleActivityItem[]
	isLoading: boolean
}

export function ModuleActivityChart({ data, isLoading }: ModuleActivityChartProps) {
	if (isLoading) {
		return <ModuleActivityChartSkeleton />
	}

	return (
		<Card className="border-none">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Actividad por Módulo</CardTitle>
					<CardDescription>Porcentaje de elementos activos</CardDescription>
				</div>
				<BarChart3 className="text-muted-foreground h-4 w-4" />
			</CardHeader>
			<CardContent className="px-2 py-0">
				<div className="h-[250px] w-full max-w-[90dvw]">
					<ChartContainer
						config={{
							STARTUP_FOLDERS: {
								label: "Carpetas de Arranque",
							},
							WORK_ORDERS: {
								label: "Órdenes de Trabajo",
							},
							WORK_PERMITS: {
								label: "Permisos de Trabajo",
							},
							MAINTENANCE_PLANS: {
								label: "Planes de Mantenimiento",
							},
							EQUIPMENT: {
								label: "Equipos",
							},
							USERS: {
								label: "Usuarios",
							},
							COMPANIES: {
								label: "Empresas",
							},
						}}
						className="h-full w-full"
					>
						<BarChart data={data} layout="vertical">
							<CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
							<XAxis type="number" domain={[0, 100]} />
							<YAxis dataKey="name" type="category" />

							<ChartTooltip
								content={<ChartTooltipContent formatter={(value) => [`${value}%`, "Actividad"]} />}
							/>

							<Bar dataKey="percentage" name="% Activo" radius={[0, 4, 4, 0]}>
								{data.map((entry, index) => {
									let color = "var(--color-red-500)"
									if (entry.percentage >= 80) color = "var(--color-green-500)"
									else if (entry.percentage >= 60) color = "var(--color-yellow-500)"
									return <Cell key={`cell-${index}`} fill={color} />
								})}
							</Bar>
						</BarChart>
					</ChartContainer>
				</div>
			</CardContent>
		</Card>
	)
}

function ModuleActivityChartSkeleton() {
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
