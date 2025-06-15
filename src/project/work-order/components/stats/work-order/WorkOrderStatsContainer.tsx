"use client"

import { useWorkOrderStats } from "@/project/work-order/hooks/use-work-order-stats"

import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"
import { WorkOrderPriorityChart } from "./WorkOrderPriorityChart"
import { WorkOrderMonthlyChart } from "./WorkOrderMonthlyChart"
import { WorkOrderStatusChart } from "./WorkOrderStatusChart"
import { WorkOrderStatCards } from "./WorkOrderStatsCards"

export function WorkOrderStatsContainer() {
	const { data, isLoading } = useWorkOrderStats()

	if (isLoading) return <ChartSkeleton />

	return (
		<div className="space-y-4">
			{data && (
				<>
					<WorkOrderStatCards data={data} />

					<div className="grid gap-4 xl:grid-cols-3">
						<WorkOrderStatusChart data={data} />
						<WorkOrderPriorityChart data={data} />
						<WorkOrderMonthlyChart data={data} />
					</div>
				</>
			)}
		</div>
	)
}
