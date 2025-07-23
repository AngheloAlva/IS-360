"use client"

import { ClipboardListIcon, FileCheckIcon, FileWarningIcon, UsersIcon } from "lucide-react"

import { useWorkPermitFiltersStore } from "../../stores/work-permit-filters-store"
import { useWorkPermitStats } from "../../hooks/use-work-permit-stats"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"
import WorkPermitActivityChart from "./WorkPermitActivityChart"
import WorkPermitStatusChart from "./WorkPermitStatusChart"
import WorkPermitTypeChart from "./WorkPermitTypeChart"
import { WORK_PERMIT_STATUS } from "@prisma/client"

export default function WorkPermitStatsContainer() {
	const filters = useWorkPermitFiltersStore()

	const { data, isLoading } = useWorkPermitStats({
		search: filters.search,
		companyId: filters.companyId,
		approvedBy: filters.approvedBy,
		typeFilter: filters.typeFilter,
		statusFilter: filters.statusFilter,
		date: filters.date ? new Date(filters.date) : null,
	})

	if (isLoading) return <ChartSkeleton />

	return (
		<div className="space-y-4">
			{data && (
				<>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card
							className="cursor-pointer overflow-hidden border-none pt-0 hover:brightness-90"
							onClick={() => filters.resetFilters()}
						>
							<div className="bg-gradient-to-br from-pink-600 to-pink-700 p-1.5" />
							<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
								<CardTitle className="text-sm font-medium sm:text-base">
									Total de Permisos
								</CardTitle>
								<div className="rounded-lg bg-pink-600/20 p-1.5 text-pink-600">
									<ClipboardListIcon className="text-pink-6s00 h-5 w-5" />
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{data.totalWorkPermits || 0}</div>
								<p className="text-muted-foreground text-xs">Permisos registrados</p>
							</CardContent>
						</Card>

						<Card
							className="cursor-pointer overflow-hidden border-none pt-0 hover:brightness-90"
							onClick={() => filters.setStatusFilter(WORK_PERMIT_STATUS.ACTIVE)}
						>
							<div className="bg-gradient-to-br from-pink-700 to-rose-500 p-1.5" />
							<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
								<CardTitle className="text-sm font-medium sm:text-base">Permisos Activos</CardTitle>
								<div className="rounded-lg bg-pink-700/20 p-1.5 text-pink-700">
									<FileCheckIcon className="h-5 w-5 text-pink-700" />
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
							className="cursor-pointer overflow-hidden border-none pt-0 hover:brightness-90"
							onClick={() => filters.setStatusFilter(WORK_PERMIT_STATUS.REVIEW_PENDING)}
						>
							<div className="bg-gradient-to-br from-rose-500 to-rose-600 p-1.5" />
							<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
								<CardTitle className="text-sm font-medium sm:text-base">
									Permisos Pendientes
								</CardTitle>
								<div className="rounded-lg bg-rose-500/20 p-1.5 text-rose-500">
									<FileWarningIcon className="h-5 w-5 text-rose-500" />
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
							<div className="bg-gradient-to-br from-rose-600 to-rose-700 p-1.5" />
							<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
								<CardTitle className="text-sm font-medium sm:text-base">
									Empresas con Permisos
								</CardTitle>
								<div className="rounded-lg bg-rose-600/20 p-1.5 text-rose-600">
									<UsersIcon className="h-5 w-5 text-rose-600" />
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

					<div className="grid gap-4 xl:grid-cols-3">
						<WorkPermitStatusChart total={data.totalWorkPermits} data={data.workPermitsByStatus} />
						<WorkPermitTypeChart data={data.workPermitsByType} />
						<WorkPermitActivityChart data={data.activityData} />
					</div>
				</>
			)}
		</div>
	)
}
