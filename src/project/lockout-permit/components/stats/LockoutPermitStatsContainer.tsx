"use client"

import { LockIcon, FileCheckIcon, FileWarningIcon, UsersIcon } from "lucide-react"

import { useLockoutPermitFiltersStore } from "../../stores/lockout-permit-filters-store"
import { useLockoutPermitStats } from "../../hooks/use-lockout-permit-stats"
import { LOCKOUT_PERMIT_STATUS } from "@prisma/client"
import { cn } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import LockoutPermitActivityChart from "./LockoutPermitActivityChart"
import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"
import LockoutPermitStatusChart from "./LockoutPermitStatusChart"
import LockoutPermitTypeChart from "./LockoutPermitTypeChart"

export default function LockoutPermitStatsContainer() {
	const filters = useLockoutPermitFiltersStore()

	const { data, isLoading } = useLockoutPermitStats({
		companyId: filters.companyId,
		dateRange: filters.dateRange,
	})

	if (isLoading) return <ChartSkeleton />

	return (
		<div className="space-y-4">
			{data && (
				<>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card
							className="group relative cursor-pointer overflow-hidden border-none pt-0 transition-all hover:scale-105"
							onClick={() => filters.resetFilters()}
						>
							<div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-1.5" />

							<div className="absolute top-0 left-0 h-16 w-16 -translate-x-4 -translate-y-4 rounded-full bg-yellow-600/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
							<div className="absolute right-0 bottom-0 h-16 w-16 translate-x-4 translate-y-4 rounded-full bg-yellow-600/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

							<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
								<CardTitle>Total de Permisos</CardTitle>
								<div className="rounded-lg bg-yellow-600/20 p-1.5 text-yellow-600">
									<LockIcon className="h-5 w-5" />
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{data.overview.total || 0}</div>
								<p className="text-muted-foreground text-xs">Permisos de bloqueo registrados</p>
							</CardContent>
						</Card>

						<Card
							className="group relative cursor-pointer overflow-hidden border-none pt-0 transition-all hover:scale-105"
							onClick={() => filters.setStatusFilter(LOCKOUT_PERMIT_STATUS.ACTIVE)}
						>
							<div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-1.5" />
							<div
								className={cn(
									"absolute top-0 left-0 h-16 w-16 -translate-x-4 -translate-y-4 rounded-full bg-yellow-700/30 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100",
									{
										"opacity-100": filters.statusFilter === LOCKOUT_PERMIT_STATUS.ACTIVE,
									}
								)}
							/>
							<div
								className={cn(
									"absolute right-0 bottom-0 h-16 w-16 translate-x-4 translate-y-4 rounded-full bg-yellow-700/30 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100",
									{
										"opacity-100": filters.statusFilter === LOCKOUT_PERMIT_STATUS.ACTIVE,
									}
								)}
							/>

							<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
								<CardTitle>Permisos Activos</CardTitle>
								<div className="rounded-lg bg-yellow-700/20 p-1.5 text-yellow-700">
									<FileCheckIcon className="h-5 w-5" />
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{data.overview.active || 0}</div>
								<p className="text-muted-foreground text-xs">Permisos en estado activo</p>
							</CardContent>
						</Card>

						<Card
							className="group relative cursor-pointer overflow-hidden border-none pt-0 transition-all hover:scale-105"
							onClick={() => filters.setStatusFilter(LOCKOUT_PERMIT_STATUS.REVIEW_PENDING)}
						>
							<div className="bg-gradient-to-br from-yellow-700 to-lime-600 p-1.5" />
							<div
								className={cn(
									"absolute top-0 left-0 h-16 w-16 -translate-x-4 -translate-y-4 rounded-full bg-lime-600/30 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100",
									{
										"opacity-100": filters.statusFilter === LOCKOUT_PERMIT_STATUS.REVIEW_PENDING,
									}
								)}
							/>
							<div
								className={cn(
									"absolute right-0 bottom-0 h-16 w-16 translate-x-4 translate-y-4 rounded-full bg-lime-600/30 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100",
									{
										"opacity-100": filters.statusFilter === LOCKOUT_PERMIT_STATUS.REVIEW_PENDING,
									}
								)}
							/>

							<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
								<CardTitle>Permisos Pendientes</CardTitle>
								<div className="rounded-lg bg-lime-600/20 p-1.5 text-lime-600">
									<FileWarningIcon className="h-5 w-5" />
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{data.overview.pending || 0}</div>
								<p className="text-muted-foreground text-xs">Permisos pendientes de revisión</p>
							</CardContent>
						</Card>

						<Card
							className="group relative cursor-pointer overflow-hidden border-none pt-0 transition-all hover:scale-105"
							onClick={() => filters.setStatusFilter(LOCKOUT_PERMIT_STATUS.COMPLETED)}
						>
							<div className="bg-gradient-to-br from-lime-700 to-lime-600 p-1.5" />
							<div className="absolute top-0 left-0 h-16 w-16 -translate-x-4 -translate-y-4 rounded-full bg-lime-600/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
							<div className="absolute right-0 bottom-0 h-16 w-16 translate-x-4 translate-y-4 rounded-full bg-lime-600/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

							<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
								<CardTitle>Permisos Completados</CardTitle>
								<div className="rounded-lg bg-lime-600/20 p-1.5 text-lime-600">
									<UsersIcon className="h-5 w-5" />
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{data.overview.completed || 0}</div>
								<p className="text-muted-foreground text-xs">Permisos completados</p>
							</CardContent>
						</Card>
					</div>

					<div className="grid gap-4 xl:grid-cols-3">
						<LockoutPermitStatusChart data={data.overview} percentages={data.percentages} />
						<LockoutPermitTypeChart data={data.byType} />
						<LockoutPermitActivityChart data={data.byMonth} />
					</div>
				</>
			)}
		</div>
	)
}
