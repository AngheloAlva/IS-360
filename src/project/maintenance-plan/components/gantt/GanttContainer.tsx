"use client"

import { useMemo, useState } from "react"

import {
	useMaintenanceSchedule,
	RANGE_OPTIONS,
	type RangeKey,
} from "@/project/maintenance-plan/hooks/use-maintenance-schedule"
import { exportGanttToExcel } from "./export-gantt-excel"
import { buildLocationTree } from "./build-location-tree"
import GanttToolbar from "./GanttToolbar"
import GanttChart from "./GanttChart"

import { Skeleton } from "@/shared/components/ui/skeleton"

export default function GanttContainer() {
	const now = new Date()
	const [startMonth, setStartMonth] = useState(1)
	const [startYear, setStartYear] = useState(now.getFullYear())
	const [rangeKey, setRangeKey] = useState<RangeKey>("ANNUAL")
	const [isExporting, setIsExporting] = useState(false)

	const rangeMonths = RANGE_OPTIONS[rangeKey].months
	const { data, isLoading } = useMaintenanceSchedule(startMonth, startYear, rangeMonths)

	const handleNavigate = (newStartMonth: number, newStartYear: number) => {
		setStartMonth(newStartMonth)
		setStartYear(newStartYear)
	}

	const handleRangeChange = (key: RangeKey) => {
		setRangeKey(key)
		// Reset to January of current year for annual, or current month for monthly
		if (key === "ANNUAL") {
			setStartMonth(1)
			setStartYear(now.getFullYear())
		} else if (key === "MONTHLY") {
			setStartMonth(now.getMonth() + 1)
			setStartYear(now.getFullYear())
		}
	}

	const exportTree = useMemo(
		() =>
			data
				? buildLocationTree({
						locations: data.locations,
						tasksByLocationId: data.tasksByLocationId,
					})
				: [],
		[data]
	)

	const handleExport = async () => {
		if (!data) return
		setIsExporting(true)
		try {
			await exportGanttToExcel(exportTree, data.months)
		} finally {
			setIsExporting(false)
		}
	}

	return (
		<div className="space-y-4">
			<GanttToolbar
				startMonth={startMonth}
				startYear={startYear}
				rangeKey={rangeKey}
				onNavigate={handleNavigate}
				onRangeChange={handleRangeChange}
				onExport={handleExport}
				isExporting={isExporting}
			/>

			{isLoading || !data ? (
				<Skeleton className="h-125 w-full rounded-lg" />
			) : (
				<GanttChart data={data} />
			)}
		</div>
	)
}
