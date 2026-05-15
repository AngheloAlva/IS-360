import { useQuery } from "@tanstack/react-query"

import type {
	PLAN_FREQUENCY,
	TASK_SPECIALTY,
	TASK_TYPE,
	WORK_ORDER_STATUS,
} from "@/generated/prisma/enums"

interface ScheduledDate {
	month: number
	year: number
	day: number
}

export interface WorkOrderInRange {
	otNumber: string
	status: WORK_ORDER_STATUS
	month: number
	year: number
	day: number
}

export interface ScheduleTask {
	id: string
	slug: string
	name: string
	planName: string
	planSlug: string
	frequency: PLAN_FREQUENCY
	specialty: TASK_SPECIALTY | null
	taskType: TASK_TYPE | null
	nextDate: string
	isAutomated: boolean
	automatedDaysInAdvance: number
	locationId: string
	location: string
	equipmentName: string
	lastCompleted: string | null
	lastCompletedOt: string | null
	scheduledDates: ScheduledDate[]
	workOrdersInRange: WorkOrderInRange[]
}

export interface MonthMeta {
	month: number
	year: number
	daysInMonth: number
	label: string
}

export interface ScheduleLocation {
	id: string
	name: string
	parentId: string | null
}

export interface ScheduleResponse {
	months: MonthMeta[]
	startMonth: number
	startYear: number
	rangeMonths: number
	locations: ScheduleLocation[]
	tasksByLocationId: Record<string, ScheduleTask[]>
}

export const RANGE_OPTIONS = {
	ANNUAL: { label: "Anual", months: 12 },
	SEMESTER: { label: "Semestral", months: 6 },
	QUARTER: { label: "Trimestral", months: 3 },
	MONTHLY: { label: "Mensual", months: 1 },
} as const

export type RangeKey = keyof typeof RANGE_OPTIONS

export const useMaintenanceSchedule = (
	startMonth: number,
	startYear: number,
	rangeMonths: number
) => {
	return useQuery<ScheduleResponse>({
		queryKey: ["maintenance-schedule", { startMonth, startYear, rangeMonths }],
		queryFn: async () => {
			const res = await fetch(
				`/api/maintenance-plan/schedule?startMonth=${startMonth}&startYear=${startYear}&rangeMonths=${rangeMonths}`
			)
			if (!res.ok) throw new Error("Error fetching schedule")
			return res.json()
		},
		refetchOnWindowFocus: false,
		staleTime: 2 * 60 * 1000,
	})
}
