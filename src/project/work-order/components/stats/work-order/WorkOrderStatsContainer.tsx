"use client"

import { useWorkOrderStats } from "@/project/work-order/hooks/use-work-order-stats"
import { useWorkOrderFiltersStore } from "@/project/work-order/stores/work-order-filters-store"

import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"
import { WorkOrderPriorityChart } from "./WorkOrderPriorityChart"
import { WorkOrderMonthlyChart } from "./WorkOrderMonthlyChart"
import { WorkOrderStatusChart } from "./WorkOrderStatusChart"
import { WorkOrderStatCards } from "./WorkOrderStatsCards"

export function WorkOrderStatsContainer() {
	// Usar los filtros del store
	const filters = useWorkOrderFiltersStore()

	// Pasar los filtros al hook de estadísticas
	const { data, isLoading } = useWorkOrderStats({
		search: filters.search,
		companyId: filters.companyId,
		dateRange: filters.dateRange,
		typeFilter: filters.typeFilter,
		statusFilter: filters.statusFilter,
		priorityFilter: filters.priorityFilter,
		onlyWithRequestClousure: filters.onlyWithRequestClousure,
	})

	if (isLoading) return <ChartSkeleton />

	return (
		<div className="space-y-4">
			{data && (
				<>
					<WorkOrderStatCards data={data} />

					<div className="grid gap-4 xl:grid-cols-3">
						<WorkOrderStatusChart data={data} />
						<WorkOrderPriorityChart data={data} />
						<WorkOrderMonthlyChart data={data.charts} />
					</div>
				</>
			)}
		</div>
	)
}
