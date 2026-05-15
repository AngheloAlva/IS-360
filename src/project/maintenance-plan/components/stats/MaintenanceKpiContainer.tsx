"use client"

import { useMaintenanceKpi } from "@/project/maintenance-plan/hooks/use-maintenance-kpi"

import PreventiveVsCorrectiveChart from "./PreventiveVsCorrectiveChart"
import MaintenanceKpiFilterBar from "./MaintenanceKpiFilterBar"
import MaintenanceKpiCards from "./MaintenanceKpiCards"
import WrResponseChart from "./WrResponseChart"
import BacklogChart from "./BacklogChart"
import OnTimeChart from "./OnTimeChart"
import { KpiDrillDownSheet } from "./drill-down/KpiDrillDownSheet"

import { Skeleton } from "@/shared/components/ui/skeleton"

export default function MaintenanceKpiContainer() {
	const { data, isLoading } = useMaintenanceKpi()

	return (
		<div className="space-y-6">
			<MaintenanceKpiFilterBar />

			{isLoading || !data ? (
				<>
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} className="h-32 w-full rounded-xl" />
						))}
					</div>
					<div className="grid gap-4 xl:grid-cols-3">
						<Skeleton className="col-span-2 h-100 rounded-xl" />
						<Skeleton className="h-100 rounded-xl" />
					</div>
					<div className="grid gap-4 xl:grid-cols-2">
						<Skeleton className="h-100 rounded-xl" />
						<Skeleton className="h-100 rounded-xl" />
					</div>
				</>
			) : (
				<>
					<MaintenanceKpiCards cards={data.cards} />

					<div className="grid gap-4 xl:grid-cols-3">
						<div className="xl:col-span-2">
							<PreventiveVsCorrectiveChart data={data.charts.preventiveVsCorrective} />
						</div>
						<OnTimeChart data={data.charts.onTime} onTimePercent={data.cards.onTimePercent} />
					</div>

					<div className="grid gap-4 xl:grid-cols-2">
						<BacklogChart data={data.charts.backlog} />
						<WrResponseChart data={data.charts.wrResponse} />
					</div>
				</>
			)}

			{/* Single drill-down sheet — mounted once at container level, reads Zustand store */}
			<KpiDrillDownSheet />
		</div>
	)
}
