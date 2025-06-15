import { AlertTriangleIcon, ClockAlertIcon, ListOrderedIcon, WrenchIcon } from "lucide-react"

import { MaintenancePlanBasicStats } from "@/project/maintenance-plan/hooks/use-maintenance-plan-stats"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

interface MaintenancePlanStatsProps {
	stats: MaintenancePlanBasicStats
}

export default function MaintenancePlanStatsCards({ stats }: MaintenancePlanStatsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card className="overflow-hidden border-none pt-0">
				<div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-1.5" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle>Planes Totales</CardTitle>
					<div className="rounded-lg bg-indigo-500/20 p-1.5 text-indigo-500">
						<WrenchIcon className="size-5.5" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.totalPlans}</div>
					<p className="text-muted-foreground text-xs">Planes de mantenimiento registrados</p>
				</CardContent>
			</Card>

			<Card className="overflow-hidden border-none pt-0">
				<div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-1.5" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle>Tareas Totales</CardTitle>
					<div className="rounded-lg bg-indigo-600/20 p-1.5 text-indigo-600">
						<ListOrderedIcon className="size-5.5" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.totalTasks}</div>
					<p className="text-muted-foreground text-xs">Tareas programadas</p>
				</CardContent>
			</Card>

			<Card className="overflow-hidden border-none pt-0">
				<div className="bg-gradient-to-r from-indigo-700 to-purple-500 p-1.5" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle>Proximas Tareas</CardTitle>
					<div className="rounded-lg bg-indigo-700/20 p-1.5 text-indigo-700">
						<AlertTriangleIcon className="size-5.5" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.tasksWithUpcomingDate}</div>
					<p className="text-muted-foreground text-xs">Tareas programadas para el próximo mes</p>
				</CardContent>
			</Card>

			<Card className="overflow-hidden border-none pt-0">
				<div className="bg-gradient-to-r from-purple-500 to-purple-600 p-1.5" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle>Tareas Atrasadas</CardTitle>
					<div className="rounded-lg bg-purple-500/20 p-1.5 text-purple-500">
						<ClockAlertIcon className="size-5.5" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.tasksWithOverdueDate}</div>
					<p className="text-muted-foreground text-xs">Tareas con fecha programada vencida</p>
				</CardContent>
			</Card>
		</div>
	)
}
