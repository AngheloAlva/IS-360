"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ActivityIcon, AlertTriangleIcon, CalendarClockIcon, ShieldAlertIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

import type {
	MaintenancePlanHealthStats,
	MaintenancePlanRiskStats,
} from "@/project/maintenance-plan/hooks/use-maintenance-plan-specific-stats"

interface MaintenancePlanOperationalInsightsProps {
	health: MaintenancePlanHealthStats
	risk: MaintenancePlanRiskStats
}

export default function MaintenancePlanOperationalInsights({
	health,
	risk,
}: MaintenancePlanOperationalInsightsProps) {
	const riskLabel = risk.level === "high" ? "Alto" : risk.level === "medium" ? "Medio" : "Bajo"

	return (
		<div className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-linear-to-r from-indigo-500 to-indigo-600 p-1.5 dark:from-indigo-700 dark:to-indigo-800" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle>Salud del Plan</CardTitle>
						<div className="rounded-lg bg-indigo-500/20 p-1.5 text-indigo-500 dark:bg-indigo-700/20 dark:text-indigo-700">
							<ActivityIcon className="size-5.5 text-purple-600" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{health.planHealthScore}%</div>
						<p className="text-muted-foreground text-xs">Tareas al día vs total activas</p>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-linear-to-r from-indigo-600 to-indigo-700 p-1.5 dark:from-indigo-800 dark:to-indigo-900" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle>Cumplimiento OT (30 días)</CardTitle>
						<div className="rounded-lg bg-indigo-600/20 p-1.5 text-indigo-600 dark:bg-indigo-800/20 dark:text-indigo-800">
							<ShieldAlertIcon className="size-5.5 text-indigo-600" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{health.completionRateLast30Days}%</div>
						<p className="text-muted-foreground text-xs">
							{health.completedWorkOrdersLast30Days}/{health.totalWorkOrdersLast30Days} OTs
							completadas
						</p>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-linear-to-r from-indigo-700 to-purple-500 p-1.5 dark:from-indigo-900 dark:to-purple-700" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle>Riesgo Operativo</CardTitle>
						<div className="rounded-lg bg-indigo-700/20 p-1.5 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-900">
							<AlertTriangleIcon className="size-5.5" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<div className="text-2xl font-bold">{risk.overdueTasksWithoutActiveOrder}</div>
							<Badge
								className={cn("border border-emerald-500/50 bg-emerald-500/10 text-emerald-600", {
									"border-amber-500/50 bg-amber-500/10 text-amber-600": risk.level === "medium",
									"border-red-500/50 bg-red-500/10 text-red-600": risk.level === "high",
								})}
							>
								{riskLabel}
							</Badge>
						</div>
						<p className="text-muted-foreground text-xs">Tareas vencidas sin OT activa</p>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-linear-to-r from-purple-500 to-purple-600 p-1.5 dark:from-purple-700 dark:to-purple-800" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle>Próximas 7 días</CardTitle>
						<div className="rounded-lg bg-purple-500/20 p-1.5 text-purple-500 dark:bg-purple-700/20 dark:text-purple-700">
							<CalendarClockIcon className="size-5.5" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{health.tasksNext7Days}</div>
						<p className="text-muted-foreground text-xs">Tareas a ejecutar en la próxima semana</p>
					</CardContent>
				</Card>
			</div>

			{/*{risk.tasks.length > 0 && (
				<Card className="border-none">
					<CardHeader>
						<CardTitle className="text-base">Riesgos críticos a priorizar</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{risk.tasks.map((task) => (
							<div
								key={task.id}
								className="bg-muted/30 flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
							>
								<div>
									<p className="text-sm font-semibold">{task.name}</p>
									<p className="text-muted-foreground text-xs">
										{task.equipmentName} - {task.equipmentLocation}
									</p>
								</div>
								<div className="text-muted-foreground flex items-center gap-3 text-xs">
									<span>
										Vence: {format(new Date(task.nextDate), "dd/MM/yyyy", { locale: es })}
									</span>
									<Badge variant="outline">{task.daysOverdue} días atraso</Badge>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			)}*/}
		</div>
	)
}
