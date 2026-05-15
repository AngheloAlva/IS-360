"use client"

import { Suspense, lazy } from "react"

import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"

const WorkOrderStatsContainer = lazy(() =>
	import("./WorkOrderStatsContainer").then((module) => ({
		default: module.WorkOrderStatsContainer,
	}))
)

export function LazyWorkOrderStatsContainer() {
	return (
		<Suspense fallback={<ChartSkeleton />}>
			<WorkOrderStatsContainer />
		</Suspense>
	)
}
