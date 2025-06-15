"use client"

import { ClipboardListIcon, FileCheckIcon, FileWarningIcon, UsersIcon } from "lucide-react"

import { useWorkPermitStats } from "../../hooks/use-work-permit-stats"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"
import WorkPermitActivityChart from "./WorkPermitActivityChart"
import WorkPermitStatusChart from "./WorkPermitStatusChart"
import WorkPermitTypeChart from "./WorkPermitTypeChart"

export default function WorkPermitStatsContainer() {
	const { data, isLoading } = useWorkPermitStats()

	if (isLoading) return <ChartSkeleton />

	return (
		<div className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-pink-600 to-pink-700 p-1.5" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">Total de Permisos</CardTitle>
						<div className="rounded-lg bg-pink-600/20 p-1.5 text-pink-600">
							<ClipboardListIcon className="text-pink-6s00 h-5 w-5" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data?.totalWorkPermits || 0}</div>
						<p className="text-muted-foreground text-xs">Permisos registrados</p>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-pink-700 to-rose-500 p-1.5" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">Permisos Activos</CardTitle>
						<div className="rounded-lg bg-pink-700/20 p-1.5 text-pink-700">
							<FileCheckIcon className="h-5 w-5 text-pink-700" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{data?.workPermitsByStatus.find((s) => s.status === "ACTIVE")?.count || 0}
						</div>
						<p className="text-muted-foreground text-xs">Permisos en estado activo</p>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-rose-500 to-rose-600 p-1.5" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">Permisos En Progreso</CardTitle>
						<div className="rounded-lg bg-rose-500/20 p-1.5 text-rose-500">
							<FileWarningIcon className="h-5 w-5 text-rose-500" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{data?.workPermitsByStatus.find((s) => s.status === "IN_PROGRESS")?.count || 0}
						</div>
						<p className="text-muted-foreground text-xs">Permisos en ejecución</p>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-rose-600 to-rose-700 p-1.5" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">Empresas con Permisos</CardTitle>
						<div className="rounded-lg bg-rose-600/20 p-1.5 text-rose-600">
							<UsersIcon className="h-5 w-5 text-rose-600" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data?.activeWorkPermitsByCompany.length || 0}</div>
						<p className="text-muted-foreground text-xs">Empresas con permisos activos</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 xl:grid-cols-3">
				{data?.workPermitsByStatus && (
					<WorkPermitStatusChart total={data.totalWorkPermits} data={data.workPermitsByStatus} />
				)}
				{data?.workPermitsByType && <WorkPermitTypeChart data={data.workPermitsByType} />}
				{data?.activityData && <WorkPermitActivityChart data={data.activityData} />}
			</div>
		</div>
	)
}
