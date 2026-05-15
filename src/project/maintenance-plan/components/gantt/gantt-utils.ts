import type { ScheduleTask, WorkOrderInRange } from "@/project/maintenance-plan/hooks/use-maintenance-schedule"
import type { WORK_ORDER_STATUS } from "@/generated/prisma/enums"

export function isWeekend(day: number, month: number, year: number): boolean {
	const dow = new Date(year, month - 1, day).getDay()
	return dow === 0 || dow === 6
}

export type DotState =
	| { kind: "completed"; wo: WorkOrderInRange }
	| { kind: "wo-pending"; wo: WorkOrderInRange }
	| { kind: "future-automated" }
	| { kind: "future-manual" }
	| { kind: "stuck" }

export function getDotState(
	task: ScheduleTask,
	day: number,
	month: number,
	year: number,
	today: Date
): DotState | null {
	const wo = task.workOrdersInRange.find(
		(w) => w.day === day && w.month === month && w.year === year
	)
	if (wo) {
		if (wo.status === "COMPLETED") return { kind: "completed", wo }
		return { kind: "wo-pending", wo }
	}

	const projected = task.scheduledDates.some(
		(d) => d.day === day && d.month === month && d.year === year
	)
	if (!projected) return null

	const cellDate = new Date(year, month - 1, day)
	const nextDate = new Date(task.nextDate)
	const nextDateDay = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate())

	const isFirstProjection =
		cellDate.getTime() === nextDateDay.getTime()

	if (isFirstProjection && task.isAutomated && nextDateDay < today) {
		return { kind: "stuck" }
	}

	if (task.isAutomated) return { kind: "future-automated" }
	return { kind: "future-manual" }
}

export function isInActivationWindow(
	task: ScheduleTask,
	day: number,
	month: number,
	year: number
): boolean {
	if (!task.isAutomated) return false
	const nextDate = new Date(task.nextDate)
	const nextDateDay = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate())
	const windowStart = new Date(nextDateDay)
	windowStart.setDate(windowStart.getDate() - task.automatedDaysInAdvance)
	const cellDate = new Date(year, month - 1, day)
	return cellDate >= windowStart && cellDate < nextDateDay
}

export interface DotStyle {
	classes: string
	label: string
	description: string
}

export function getDotStyle(state: DotState, taskName: string): DotStyle {
	const date = "wo" in state ? `OT ${state.wo.otNumber}` : ""
	switch (state.kind) {
		case "completed":
			return {
				classes: "bg-emerald-500",
				label: "Completada",
				description: `${taskName} — ${date} completada`,
			}
		case "wo-pending":
			return {
				classes: "bg-blue-500",
				label: "OT generada",
				description: `${taskName} — ${date} (${statusLabel(state.wo.status)})`,
			}
		case "future-automated":
			return {
				classes: "bg-cyan-400",
				label: "Automática (pendiente)",
				description: `${taskName} — se generará automáticamente`,
			}
		case "stuck":
			return {
				classes: "animate-pulse bg-red-500",
				label: "Atorada",
				description: `${taskName} — la OT anterior no se cerró, bloqueando la generación automática`,
			}
		case "future-manual":
		default:
			return {
				classes: "bg-amber-400",
				label: "Manual (pendiente)",
				description: `${taskName} — fecha programada (manual)`,
			}
	}
}

function statusLabel(status: WORK_ORDER_STATUS): string {
	const map: Record<string, string> = {
		PLANNED: "Planificada",
		IN_PROGRESS: "En curso",
		COMPLETED: "Completada",
		CANCELLED: "Cancelada",
		ON_HOLD: "En espera",
	}
	return map[status] ?? status
}
