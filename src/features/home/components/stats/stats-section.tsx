import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"
import { TaskFrequencyLabels } from "@/lib/consts/task-frequency"
import { AreasLabels } from "@/lib/consts/areas"

import { PieChart } from "@/features/document/components/charts/PieChart"
import { DashboardStatsCard } from "./stats-card"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

import type { DashboardStatsResponse } from "@/features/home/hooks/use-dashboard-stats"
import { BookOpen, Building, Calendar, ChevronRight, FileText } from "lucide-react"

interface StatsSectionProps {
	data: DashboardStatsResponse
	isLoading: boolean
}

const CHART_COLORS = {
	workOrders: {
		CORRECTIVE: "#ef4444", // red-500
		PREVENTIVE: "#22c55e", // green-500
		PREDICTIVE: "#3b82f6", // blue-500
		PROACTIVE: "#f59e0b", // amber-500
	},
	documents: {
		OPERATIONS: "#0ea5e9", // sky-500
		INSTRUCTIONS: "#6366f1", // indigo-500
		INTEGRITY_AND_MAINTENANCE: "#f97316", // orange-500
		ENVIRONMENT: "#22c55e", // green-500
		OPERATIONAL_SAFETY: "#ef4444", // red-500
		QUALITY_AND_OPERATIONAL_EXCELLENCE: "#3b82f6", // blue-500
		REGULATORY_COMPLIANCE: "#a855f7", // purple-500
		LEGAL: "#f59e0b", // amber-500
		COMMUNITIES: "#f43f5e", // rose-500
		PROJECTS: "#0ea5e9", // sky-500
	},
	tasks: {
		MONTHLY: "#f43f5e", // rose-500
		BIMONTHLY: "#22c55e", // green-500
		QUARTERLY: "#f97316", // orange-500
		FOURMONTHLY: "#a855f7", // purple-500
		BIANNUAL: "#3b82f6", // blue-500
		YEARLY: "#f59e0b", // amber-500
	},
}

export function StatsSection({ data, isLoading }: StatsSectionProps) {
	// Datos para el gráfico de OTs por tipo
	const workOrderTypeData =
		data?.workOrders.byType.map((item) => ({
			name: WorkOrderTypeLabels[item.type as keyof typeof WorkOrderTypeLabels],
			value: item._count,
			fill: CHART_COLORS.workOrders[item.type as keyof typeof CHART_COLORS.workOrders],
		})) || []

	// Datos para el gráfico de documentos por área
	const documentAreaData =
		data?.documents.byArea.map((item) => ({
			name: AreasLabels[item.area as keyof typeof AreasLabels],
			value: item._count,
			fill: CHART_COLORS.documents[item.area as keyof typeof CHART_COLORS.documents],
		})) || []

	// Datos para el gráfico de tareas por frecuencia
	const taskFrequencyData =
		data?.maintenance.tasksByFrequency.map((item) => ({
			name: TaskFrequencyLabels[item.frequency as keyof typeof TaskFrequencyLabels],
			value: item._count,
			fill: CHART_COLORS.tasks[item.frequency as keyof typeof CHART_COLORS.tasks],
		})) || []

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<DashboardStatsCard
				loading={isLoading}
				title="OTs / Libros de obras"
				href="/admin/dashboard/ordenes-de-trabajo"
				value={data?.workOrders.total.toString() ?? "--"}
				className="hover:border-amber-500 hover:bg-amber-500/10"
				icon={<BookOpen className="h-12 w-12 rounded-lg bg-amber-500/10 p-2 text-amber-500" />}
				description={`${data?.workOrders.planning} planeadas, ${data?.workOrders.inProgress} en progreso`}
			/>
			<DashboardStatsCard
				loading={isLoading}
				title="Empresas y Usuarios"
				href="/admin/dashboard/empresas"
				description="Total de empresas registradas"
				value={data?.companies.total.toString() ?? "--"}
				className="hover:border-sky-500 hover:bg-sky-500/10"
				icon={<Building className="h-12 w-12 rounded-lg bg-sky-500/10 p-2 text-sky-500" />}
			/>
			<DashboardStatsCard
				loading={isLoading}
				title="Planes de Mantenimiento"
				href="/admin/dashboard/planes-de-mantenimiento"
				value={data?.maintenance.totalPlans.toString() ?? "--"}
				className="hover:border-teal-500 hover:bg-teal-500/10"
				description={`${data?.maintenance.totalTasks} tareas programadas`}
				icon={<Calendar className="h-12 w-12 rounded-lg bg-teal-500/10 p-2 text-teal-500" />}
			/>
			<DashboardStatsCard
				loading={isLoading}
				title="Documentación"
				href="/dashboard/documentacion"
				description="Documentos registrados"
				value={data?.documents.total.toString() ?? "--"}
				className="hover:border-purple-500 hover:bg-purple-500/10"
				icon={<FileText className="h-12 w-12 rounded-lg bg-purple-500/10 p-2 text-purple-500" />}
			/>

			{/* Tareas próximas */}
			<Card className="col-span-2">
				<CardHeader>
					<CardTitle>Próximas Tareas de Mantenimiento</CardTitle>
					<CardDescription>Tareas programadas para los próximos 7 días</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4 divide-y">
						{data?.maintenance.upcomingTasks.map((task) => (
							<Link
								key={task.id}
								className="group block"
								href={`/admin/dashboard/planes-de-mantenimiento/${task.slug}/tareas`}
							>
								<div className="flex flex-col gap-1">
									<h4 className="group-hover:text-primary font-semibold">
										{task.name}
										<ChevronRight className="-mt-0.5 inline h-5 w-5 transition-all group-hover:translate-x-1" />
									</h4>
									<p className="text-muted-foreground group-hover:text-text text-sm transition-colors">
										Equipo: {task.equipment.name}
									</p>
									<p className="text-muted-foreground group-hover:text-text text-sm transition-colors">
										Siguiente Fecha: {format(new Date(task.nextDate), "PPP", { locale: es })}
									</p>
								</div>
							</Link>
						))}

						{data?.maintenance.upcomingTasks.length === 0 && (
							<p className="text-muted-foreground text-center">
								No hay tareas programadas para los próximos 7 días
							</p>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Documentos por categoría */}
			<Card className="col-span-2">
				<CardHeader>
					<CardTitle>Documentos por Categoría</CardTitle>
					<CardDescription>Distribución de documentos según su tipo</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-[300px]">
						<PieChart data={documentAreaData} />
					</div>
				</CardContent>
			</Card>

			{/* Gráficos y detalles */}
			<Card className="col-span-2">
				<CardHeader>
					<CardTitle>Distribución de OTs por Tipo</CardTitle>
					<CardDescription>Resumen de órdenes de trabajo según su clasificación</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-[300px]">
						<PieChart data={workOrderTypeData} />
					</div>
				</CardContent>
			</Card>

			{/* Distribución de frecuencias */}
			<Card className="col-span-2">
				<CardHeader>
					<CardTitle>Frecuencia de Tareas</CardTitle>
					<CardDescription>Distribución de tareas según su frecuencia</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-[300px]">
						<PieChart data={taskFrequencyData} />
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
