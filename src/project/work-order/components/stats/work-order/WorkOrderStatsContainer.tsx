"use client"

import { useWorkOrderFiltersStore } from "@/project/work-order/stores/work-order-filters-store"
import { useWorkOrderStats } from "@/project/work-order/hooks/use-work-order-stats"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
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
		responsibleId: filters.responsibleId,
		dateRange: filters.dateRange,
		typeFilter: filters.typeFilter,
		statusFilter: filters.statusFilter,
		priorityFilter: filters.priorityFilter,
		onlyWithRequestClousure: filters.onlyWithRequestClousure,
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
						<WorkOrderStatCards data={data} />
					</TabsContent>

					<TabsContent value="charts">
						<div className="grid gap-4 xl:grid-cols-3">
							<WorkOrderTypeChart data={data} total={data.cards.total} />
							<WorkOrderPriorityChart data={data} />
							<WorkOrderMonthlyChart data={data.charts} />
						</div>
					</TabsContent>
				</Tabs>
			)}
		</div>
	)
}
