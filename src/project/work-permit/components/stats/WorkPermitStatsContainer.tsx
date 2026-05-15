"use client"

import { ClipboardListIcon, FileCheckIcon, FileWarningIcon, UsersIcon } from "lucide-react"

import { useWorkPermitFiltersStore } from "../../stores/work-permit-filters-store"
import { useWorkPermitStats } from "../../hooks/use-work-permit-stats"
import { WORK_PERMIT_STATUS } from "@/generated/prisma/enums"
import { cn } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"
import WorkPermitActivityChart from "./WorkPermitActivityChart"
import WorkPermitStatusChart from "./WorkPermitStatusChart"
import WorkPermitTypeChart from "./WorkPermitTypeChart"

export default function WorkPermitStatsContainer() {
	const filters = useWorkPermitFiltersStore()

	const { data, isLoading } = useWorkPermitStats({
		search: filters.search,
		companyId: filters.companyId,
		approvedBy: filters.approvedBy,
		typeFilter: filters.typeFilter,
		statusFilter: filters.statusFilter,
		dateRange: filters.dateRange,
	})

	if (isLoading) return <ChartSkeleton />

	return (
		<div>
			{data && (
				<Tabs className="space-y-4" defaultValue="stats">
					<TabsList className="h-11 w-full py-5">
						<TabsTrigger className="h-8" value="stats">
							Estadisticas
						</TabsTrigger>
						<TabsTrigger className="h-8" value="charts">
							Graficas
						</TabsTrigger>
					</TabsList>

					<TabsContent value="stats">
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							<Card
								className="group relative cursor-pointer overflow-hidden border-none pt-0 transition-all hover:scale-105"
								onClick={() => filters.resetFilters()}
							>
								<div className="bg-linear-to-br from-pink-600 to-pink-700 p-1.5 dark:from-pink-800 dark:to-pink-900" />
								<div className="absolute top-0 left-0 h-16 w-16 -translate-x-4 -translate-y-4 rounded-full bg-pink-600/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-pink-800/30" />
								<div className="absolute right-0 bottom-0 h-16 w-16 translate-x-4 translate-y-4 rounded-full bg-pink-700/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-pink-900/30" />

								<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
									<CardTitle>Total de Permisos</CardTitle>
									<div className="rounded-lg bg-pink-600/20 p-1.5 text-pink-600 dark:bg-pink-800/20 dark:text-pink-800">
										<ClipboardListIcon className="h-5 w-5 text-pink-600 dark:text-pink-800" />
									</div>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{data.totalWorkPermits || 0}</div>
									<p className="text-muted-foreground text-xs">Permisos registrados</p>
								</CardContent>
							</Card>

							<Card
								className="group relative cursor-pointer overflow-hidden border-none pt-0 transition-all hover:scale-105"
								onClick={() => filters.setStatusFilter(WORK_PERMIT_STATUS.ACTIVE)}
							>
								<div className="bg-linear-to-br from-pink-700 to-rose-500 p-1.5 dark:from-pink-900 dark:to-rose-700" />
								<div
									className={cn(
										"absolute top-0 left-0 h-16 w-16 -translate-x-4 -translate-y-4 rounded-full bg-pink-700/30 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-pink-900/30",
										{
											"opacity-100": filters.statusFilter === WORK_PERMIT_STATUS.ACTIVE,
										}
									)}
								/>
								<div
									className={cn(
										"absolute right-0 bottom-0 h-16 w-16 translate-x-4 translate-y-4 rounded-full bg-rose-500/30 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-rose-700/30",
										{
											"opacity-100": filters.statusFilter === WORK_PERMIT_STATUS.ACTIVE,
										}
									)}
								/>

								<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
									<CardTitle>Permisos Activos</CardTitle>
									<div className="rounded-lg bg-pink-700/20 p-1.5 text-pink-700 dark:bg-pink-900/20 dark:text-pink-900">
										<FileCheckIcon className="h-5 w-5 text-pink-700 dark:text-pink-900" />
									</div>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{data.workPermitsByStatus.find((s) => s.status === WORK_PERMIT_STATUS.ACTIVE)
											?.count || 0}
									</div>
									<p className="text-muted-foreground text-xs">Permisos en estado activo</p>
								</CardContent>
							</Card>

							<Card
								className="group relative cursor-pointer overflow-hidden border-none pt-0 transition-all hover:scale-105"
								onClick={() => filters.setStatusFilter(WORK_PERMIT_STATUS.REVIEW_PENDING)}
							>
								<div className="bg-linear-to-br from-rose-500 to-rose-600 p-1.5 dark:from-rose-700 dark:to-rose-800" />
								<div
									className={cn(
										"absolute top-0 left-0 h-16 w-16 -translate-x-4 -translate-y-4 rounded-full bg-rose-500/30 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-rose-700/30",
										{
											"opacity-100": filters.statusFilter === WORK_PERMIT_STATUS.REVIEW_PENDING,
										}
									)}
								/>
								<div
									className={cn(
										"absolute right-0 bottom-0 h-16 w-16 translate-x-4 translate-y-4 rounded-full bg-rose-600/30 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-rose-800/30",
										{
											"opacity-100": filters.statusFilter === WORK_PERMIT_STATUS.REVIEW_PENDING,
										}
									)}
								/>

								<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
									<CardTitle>Permisos Pendientes</CardTitle>
									<div className="rounded-lg bg-rose-500/20 p-1.5 text-rose-500 dark:bg-rose-700/20 dark:text-rose-700">
										<FileWarningIcon className="h-5 w-5 text-rose-500 dark:text-rose-700" />
									</div>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{data.workPermitsByStatus.find(
											(s) => s.status === WORK_PERMIT_STATUS.REVIEW_PENDING
										)?.count || 0}
									</div>
									<p className="text-muted-foreground text-xs">Permisos pendientes de revisión</p>
								</CardContent>
							</Card>

							<Card className="overflow-hidden border-none pt-0">
								<div className="bg-linear-to-br from-rose-600 to-rose-700 p-1.5 dark:from-rose-800 dark:to-rose-900" />
								<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
									<CardTitle>Empresas con Permisos</CardTitle>
									<div className="rounded-lg bg-rose-600/20 p-1.5 text-rose-600 dark:bg-rose-800/20 dark:text-rose-800">
										<UsersIcon className="h-5 w-5 text-rose-600 dark:text-rose-800" />
									</div>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{data.activeWorkPermitsByCompany.length || 0}
									</div>
									<p className="text-muted-foreground text-xs">Empresas con permisos activos</p>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="charts">
						<div className="grid gap-4 xl:grid-cols-3">
							<WorkPermitStatusChart
								total={data.totalWorkPermits}
								data={data.workPermitsByStatus}
							/>
							<WorkPermitTypeChart data={data.workPermitsByType} />
							<WorkPermitActivityChart data={data.activityData} />
						</div>
					</TabsContent>
				</Tabs>
			)}
		</div>
	)
}
