"use client"

import { useWorkOrderFiltersStore } from "@/project/work-order/stores/work-order-filters-store"
import { useWorkOrderStats } from "@/project/work-order/hooks/use-work-order-stats"

import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"
import { WorkOrderPriorityChart } from "./WorkOrderPriorityChart"
import { WorkOrderMonthlyChart } from "./WorkOrderMonthlyChart"
import { WorkOrderTypeChart } from "./WorkOrderStatusChart"
import { WorkOrderStatCards } from "./WorkOrderStatsCards"

export function WorkOrderStatsContainer() {
	const filters = useWorkOrderFiltersStore()

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
						<WorkOrderTypeChart data={data} total={data.cards.total} />
						<WorkOrderPriorityChart data={data} />
						<WorkOrderMonthlyChart data={data.charts} />
					</div>
				</>
			)}
		</div>
	)
}
