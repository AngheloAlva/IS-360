"use client"

import { useSafetyTalkStats } from "../../hooks/use-safety-talk-stats"
import { SafetyTalkChartsContainer } from "../stats/SafetyTalkChartsContainer"
import { SafetyTalksTable } from "../data/SafetyTalksTable"
import { SafetyTalkStats } from "../stats/SafetyTalkStats"

export function SafetyTalksDashboard() {
	const { data: stats, isLoading: isLoadingStats } = useSafetyTalkStats()
	console.log(stats)

	return (
		<div className="space-y-6">
			<SafetyTalkStats
				data={{
					totalCompleted: stats?.totalSafetyTalks ?? 0,
					totalPassed: stats?.approvedSafetyTalks ?? 0,
					totalFailed: stats?.expiredSafetyTalks ?? 0,
					totalPending: stats?.pendingApprovalSafetyTalks ?? 0,
				}}
				isLoading={isLoadingStats}
			/>

			<SafetyTalkChartsContainer />

			<SafetyTalksTable />
		</div>
	)
}
