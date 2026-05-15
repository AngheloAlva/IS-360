"use client"

import { Fragment, useEffect, useMemo, useRef } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useState } from "react"
import { toast } from "sonner"
import { ChevronRightIcon, PencilIcon } from "lucide-react"

import { updateTaskSchedule } from "@/project/maintenance-plan/actions/updateTaskSchedule"
import { updateTaskFrequency } from "@/project/maintenance-plan/actions/updateTaskFrequency"
import { TaskFrequencyLabels, TaskFrequencyOptions } from "@/lib/consts/task-frequency"
import { PLAN_FREQUENCY } from "@/generated/prisma/enums"
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select"
import { getDotState, getDotStyle, isInActivationWindow, isWeekend } from "./gantt-utils"
import { buildLocationTree, type LocationTreeNode } from "./build-location-tree"
import { queryClient } from "@/lib/queryClient"
import { cn } from "@/lib/utils"

import type {
	MonthMeta,
	ScheduleResponse,
	ScheduleTask,
} from "@/project/maintenance-plan/hooks/use-maintenance-schedule"
import type { DotState } from "./gantt-utils"

interface GanttChartProps {
	data: ScheduleResponse
}

export default function GanttChart({ data }: GanttChartProps) {
	const { months, locations, tasksByLocationId } = data
	const containerRef = useRef<HTMLDivElement>(null)

	const tree = useMemo(
		() => buildLocationTree({ locations, tasksByLocationId }),
		[locations, tasksByLocationId]
	)

	const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set())

	const toggleLocation = (locationId: string) => {
		setExpandedLocations((prev) => {
			const next = new Set(prev)
			if (next.has(locationId)) next.delete(locationId)
			else next.add(locationId)
			return next
		})
	}

	const [editingCell, setEditingCell] = useState<{
		taskId: string
		fromMonth: number
		fromYear: number
		fromDay: number
	} | null>(null)

	// Cancel editing when clicking outside the table
	useEffect(() => {
		if (!editingCell) return

		const handleClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setEditingCell(null)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [editingCell])

	const isToday = (day: number, month: number, year: number) => {
		const now = new Date()
		return now.getFullYear() === year && now.getMonth() + 1 === month && now.getDate() === day
	}

	const today = (() => {
		const n = new Date()
		return new Date(n.getFullYear(), n.getMonth(), n.getDate())
	})()

	const handleCellClick = (
		taskId: string,
		day: number,
		month: number,
		year: number,
		scheduled: boolean,
		isAutomated: boolean
	) => {
		if (scheduled) {
			if (
				editingCell &&
				editingCell.taskId === taskId &&
				editingCell.fromDay === day &&
				editingCell.fromMonth === month &&
				editingCell.fromYear === year
			) {
				setEditingCell(null)
				return
			}
			setEditingCell({ taskId, fromDay: day, fromMonth: month, fromYear: year })
		} else if (editingCell && editingCell.taskId === taskId) {
			const fromDate = new Date(
				editingCell.fromYear,
				editingCell.fromMonth - 1,
				editingCell.fromDay
			)
			const toDate = new Date(year, month - 1, day)
			const deltaDays = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000)

			if (isAutomated) {
				const daysFromToday = Math.round((toDate.getTime() - today.getTime()) / 86400000)
				if (daysFromToday <= 7) {
					const confirmed = window.confirm(
						"Esta es una tarea AUTOMATIZADA y la nueva fecha está cerca (≤7 días). El cron puede generar la OT automáticamente muy pronto o ya. ¿Continuar?"
					)
					if (!confirmed) {
						setEditingCell(null)
						return
					}
				}
			}

			void handleMove(editingCell.taskId, deltaDays)
			setEditingCell(null)
		} else {
			setEditingCell(null)
		}
	}

	const handleMove = async (taskId: string, deltaDays: number) => {
		if (deltaDays === 0) return

		const result = await updateTaskSchedule({ taskId, deltaDays })
		if (result.ok) {
			toast.success(`Fecha movida ${deltaDays > 0 ? "+" : ""}${deltaDays} días`, {
				description: "Todas las fechas futuras se ajustaron automáticamente.",
			})
			void queryClient.invalidateQueries({ queryKey: ["maintenance-schedule"] })
		} else {
			toast.error("Error al mover fecha", { description: result.message })
		}
	}

	// Total day columns across all months
	const totalDayCols = months.reduce((sum, m) => sum + m.daysInMonth, 0)

	return (
		<div className="bg-background overflow-hidden rounded-lg border" ref={containerRef}>
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-xs">
					<thead>
						{/* Month header row */}
						<tr className="bg-indigo-600 text-white">
							<th
								className="bg-background text-foreground sticky left-0 z-30 min-w-72 border-r px-2 py-1.5 text-left text-xs font-medium"
								rowSpan={2}
							>
								Actividad / Trabajo
							</th>
							{months.map((m) => (
								<th
									key={`${m.year}-${m.month}`}
									colSpan={m.daysInMonth}
									className="border-r px-1 py-1 text-center text-[10px] font-semibold"
								>
									{m.label}
								</th>
							))}
							<th
								className="bg-background text-foreground sticky right-0 z-30 min-w-25 border-l px-2 py-1.5 text-center text-xs font-medium"
								rowSpan={2}
							>
								Último Mant.
							</th>
						</tr>
						{/* Day numbers row */}
						<tr className="bg-muted/50">
							{months.map((m) =>
								Array.from({ length: m.daysInMonth }, (_, i) => {
									const day = i + 1
									return (
										<th
											key={`${m.year}-${m.month}-${day}`}
											className={cn(
												"min-w-5.5 border-r px-0 py-1 text-center text-[9px] font-normal",
												isWeekend(day, m.month, m.year) && "bg-muted",
												isToday(day, m.month, m.year) &&
													"bg-indigo-100 font-bold dark:bg-indigo-900/30"
											)}
										>
											{day}
										</th>
									)
								})
							)}
						</tr>
					</thead>
					<tbody>
						{tree.map((node) => (
							<LocationRows
								key={node.id}
								node={node}
								months={months}
								expandedLocations={expandedLocations}
								toggleLocation={toggleLocation}
								editingCell={editingCell}
								handleCellClick={handleCellClick}
								today={today}
								isToday={isToday}
							/>
						))}

						{tree.length === 0 && (
							<tr>
								<td
									colSpan={totalDayCols + 2}
									className="text-muted-foreground px-4 py-12 text-center"
								>
									No hay tareas programadas para este período
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{editingCell && (
				<div className="bg-muted/80 border-t px-4 py-2 text-xs">
					<span className="font-medium">Modo mover:</span> Hacé click en el día destino para mover
					la fecha, o click fuera para cancelar.
				</div>
			)}
		</div>
	)
}

function DotCell({
	state,
	task,
	day,
	month,
	year,
	isMovingFrom,
	isClickable,
}: {
	state: DotState
	task: ScheduleTask
	day: number
	month: number
	year: number
	isMovingFrom: boolean
	isClickable: boolean
}) {
	const style = getDotStyle(state, task.name)
	const dateStr = `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`
	const otLine =
		"wo" in state
			? `OT ${state.wo.otNumber}`
			: task.isAutomated
				? `Se generará automáticamente ~${task.automatedDaysInAdvance} días antes`
				: "Generación manual"

	return (
		<TooltipProvider delayDuration={150}>
			<Tooltip>
				<TooltipTrigger asChild>
					<div
						className={cn(
							"mx-auto size-3.5 rounded-full transition-transform hover:scale-125",
							style.classes,
							isClickable && "cursor-pointer",
							isMovingFrom && "animate-pulse bg-red-400"
						)}
					/>
				</TooltipTrigger>
				<TooltipContent side="top" className="text-[11px]">
					<div className="font-medium">{style.label}</div>
					<div className="text-muted-foreground">{task.name}</div>
					<div>{dateStr}</div>
					<div className="text-muted-foreground">{otLine}</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}

function FrequencyEditor({
	taskId,
	frequency,
	isAutomated,
}: {
	taskId: string
	frequency: PLAN_FREQUENCY
	isAutomated: boolean
}) {
	const [open, setOpen] = useState(false)
	const [saving, setSaving] = useState(false)

	const handleChange = async (value: string) => {
		const next = value as PLAN_FREQUENCY
		if (next === frequency) {
			setOpen(false)
			return
		}
		if (isAutomated) {
			const confirmed = window.confirm(
				"Esta tarea es AUTOMATIZADA. Cambiar la frecuencia afecta las próximas ejecuciones del cron. ¿Continuar?"
			)
			if (!confirmed) return
		}
		setSaving(true)
		const result = await updateTaskFrequency({ taskId, frequency: next })
		setSaving(false)
		if (result.ok) {
			toast.success("Frecuencia actualizada")
			void queryClient.invalidateQueries({ queryKey: ["maintenance-schedule"] })
			setOpen(false)
		} else {
			toast.error("Error al actualizar frecuencia", { description: result.message })
		}
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="text-muted-foreground hover:text-foreground ml-auto shrink-0 rounded p-0.5"
					onClick={(e) => e.stopPropagation()}
					title="Cambiar frecuencia"
				>
					<PencilIcon className="size-3" />
				</button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-48 p-2" onClick={(e) => e.stopPropagation()}>
				<div className="text-muted-foreground mb-1.5 text-[10px] font-medium uppercase">
					Frecuencia
				</div>
				<Select value={frequency} onValueChange={handleChange} disabled={saving}>
					<SelectTrigger size="sm" className="h-8 text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{TaskFrequencyOptions.map((opt) => (
							<SelectItem key={opt.value} value={opt.value} className="text-xs">
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</PopoverContent>
		</Popover>
	)
}

interface CellInteractionProps {
	months: MonthMeta[]
	expandedLocations: Set<string>
	toggleLocation: (id: string) => void
	editingCell: {
		taskId: string
		fromMonth: number
		fromYear: number
		fromDay: number
	} | null
	handleCellClick: (
		taskId: string,
		day: number,
		month: number,
		year: number,
		scheduled: boolean,
		isAutomated: boolean
	) => void
	today: Date
	isToday: (day: number, month: number, year: number) => boolean
}

function LocationRows({
	node,
	...rest
}: { node: LocationTreeNode } & CellInteractionProps) {
	const { months, expandedLocations, toggleLocation, isToday } = rest
	const isExpanded = expandedLocations.has(node.id)
	const indentPx = 8 + node.depth * 14

	return (
		<Fragment>
			<tr
				onClick={() => toggleLocation(node.id)}
				className={cn(
					"hover:bg-muted cursor-pointer border-t transition-colors",
					node.depth === 0 ? "bg-muted/60" : "bg-muted/30"
				)}
			>
				<td className="bg-background sticky left-0 z-10 border px-2 py-1.5">
					<div className="flex items-center gap-1.5" style={{ paddingLeft: `${indentPx}px` }}>
						<ChevronRightIcon
							className={cn("size-3.5 shrink-0 transition-transform", isExpanded && "rotate-90")}
						/>
						<span
							className={cn(
								"truncate text-[11px]",
								node.depth === 0 ? "font-semibold" : "font-medium"
							)}
							title={node.name}
						>
							{node.name}
						</span>
						<span className="text-muted-foreground ml-1 text-[10px]">
							({node.subtreeTaskCount})
						</span>
					</div>
				</td>
				{months.map((m) =>
					Array.from({ length: m.daysInMonth }, (_, i) => {
						const day = i + 1
						return (
							<td
								key={`group-${node.id}-${m.year}-${m.month}-${day}`}
								className={cn(
									"border-r px-0 py-0.5",
									isWeekend(day, m.month, m.year) && "bg-muted",
									isToday(day, m.month, m.year) && "bg-indigo-100/60 dark:bg-indigo-900/30"
								)}
							/>
						)
					})
				)}
				<td className="bg-muted/40 sticky right-0 z-10 border-l px-2 py-1.5" />
			</tr>

			{isExpanded && (
				<>
					{node.children.map((child) => (
						<LocationRows key={child.id} node={child} {...rest} />
					))}
					{node.tasks.map((task) => (
						<TaskRow
							key={task.id}
							task={task}
							indentPx={indentPx + 20}
							{...rest}
						/>
					))}
				</>
			)}
		</Fragment>
	)
}

function TaskRow({
	task,
	indentPx,
	months,
	editingCell,
	handleCellClick,
	today,
	isToday,
}: { task: ScheduleTask; indentPx: number } & CellInteractionProps) {
	return (
		<tr className="hover:bg-muted/30 border-t transition-colors">
			<td className="bg-background sticky left-0 z-10 border-r py-1 pr-2">
				<div className="flex items-center gap-1.5" style={{ paddingLeft: `${indentPx}px` }}>
					<TooltipProvider delayDuration={200}>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="max-w-56 truncate text-[11px] font-medium">{task.name}</div>
							</TooltipTrigger>
							<TooltipContent side="top" align="start" className="max-w-[320px]">
								<p className="text-[11px]">{task.name}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<FrequencyEditor
						taskId={task.id}
						frequency={task.frequency}
						isAutomated={task.isAutomated}
					/>
				</div>
				<span
					className="text-muted-foreground text-[9px]"
					style={{ paddingLeft: `${indentPx}px`, display: "block" }}
				>
					{TaskFrequencyLabels[task.frequency]}
				</span>
			</td>
			{months.map((m) =>
				Array.from({ length: m.daysInMonth }, (_, i) => {
					const day = i + 1
					const dotState = getDotState(task, day, m.month, m.year, today)
					const inWindow = isInActivationWindow(task, day, m.month, m.year)
					const scheduled = dotState !== null
					const isMovingFrom =
						editingCell?.taskId === task.id &&
						editingCell.fromDay === day &&
						editingCell.fromMonth === m.month &&
						editingCell.fromYear === m.year
					const isMovingTarget = editingCell?.taskId === task.id && !scheduled
					const isClickableDot =
						dotState?.kind === "future-automated" ||
						dotState?.kind === "future-manual" ||
						dotState?.kind === "stuck"

					return (
						<td
							key={`${m.year}-${m.month}-${day}`}
							onClick={() =>
								handleCellClick(task.id, day, m.month, m.year, isClickableDot, task.isAutomated)
							}
							className={cn(
								"border-r px-0 py-0.5 text-center",
								isWeekend(day, m.month, m.year) && "bg-muted/40",
								inWindow && "bg-cyan-50 dark:bg-cyan-950/30",
								isToday(day, m.month, m.year) && "bg-indigo-50 dark:bg-indigo-900/20",
								isMovingTarget && "cursor-pointer hover:bg-indigo-100",
								isMovingFrom && "ring-2 ring-red-400 ring-inset"
							)}
						>
							{dotState && (
								<DotCell
									state={dotState}
									task={task}
									day={day}
									month={m.month}
									year={m.year}
									isMovingFrom={isMovingFrom}
									isClickable={isClickableDot}
								/>
							)}
						</td>
					)
				})
			)}
			<td className="bg-background sticky right-0 z-10 border-l px-2 py-1 text-center">
				{task.lastCompleted ? (
					<>
						<div className="text-[10px] font-medium">
							{format(new Date(task.lastCompleted), "dd/MM/yy", { locale: es })}
						</div>
						{task.lastCompletedOt && (
							<span className="text-muted-foreground text-[9px]">{task.lastCompletedOt}</span>
						)}
					</>
				) : (
					<span className="text-muted-foreground text-[10px]">—</span>
				)}
			</td>
		</tr>
	)
}
