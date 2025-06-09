"use client"

import { useWorkOrderStats } from "@/hooks/work-orders/use-work-order-stats"

import { WorkOrderPriorityChart } from "./work-order-priority-chart"
import { WorkOrderMonthlyChart } from "./work-order-monthly-chart"
import { WorkOrderStatusChart } from "./work-order-status-chart"
import { WorkOrderStatCards } from "./work-order-stat-cards"
import ChartSkeleton from "../../charts/ChartSkeleton"

export function WorkOrderDashboardStats() {
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
