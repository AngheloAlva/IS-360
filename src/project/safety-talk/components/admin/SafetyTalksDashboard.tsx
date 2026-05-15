"use client"

import { SafetyTalkChartsContainer } from "../stats/SafetyTalkChartsContainer"
import { OrphanedSafetyTalksTable } from "../data/OrphanedSafetyTalksTable"
import { SafetyTalksTable } from "../data/SafetyTalksTable"

export function SafetyTalksDashboard() {
	return (
		<div className="space-y-6">
			<SafetyTalkChartsContainer />

			<SafetyTalksTable />

			<OrphanedSafetyTalksTable />
		</div>
	)
}
