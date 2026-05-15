"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
	ClipboardListIcon,
	WrenchIcon,
	CalendarCheckIcon,
	UserIcon,
	LinkIcon,
	AlertTriangleIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/shared/components/ui/badge"
import {
	TIMELINE_EVENT_TYPES,
	type EquipmentTimelineEvent,
} from "@/project/equipment/types/equipment-timeline"

import { WorkOrderTypeBadge } from "@/project/work-order/components/badges/WorkOrderTypeBadge"
import { WorkOrderStatusBadge } from "@/project/work-order/components/badges/WorkOrderStatusBadge"
import { WorkOrderPriorityBadge } from "@/project/work-order/components/badges/WorkOrderPriorityBadge"

// ─── Category style (node + card accent by 3-category scheme) ────────────────

type EventCategory = "ST" | "OT_PLAN" | "OT"

interface CategoryStyle {
	icon: React.ElementType
	nodeBg: string
	borderLeft: string
	label: string
}

const CATEGORY_STYLE: Record<EventCategory, CategoryStyle> = {
	ST: {
		icon: ClipboardListIcon,
		nodeBg: "bg-sky-500",
		borderLeft: "border-l-sky-500",
		label: "Solicitud",
	},
	OT_PLAN: {
		icon: CalendarCheckIcon,
		nodeBg: "bg-purple-500",
		borderLeft: "border-l-purple-500",
		label: "OT (Plan)",
	},
	OT: {
		icon: WrenchIcon,
		nodeBg: "bg-orange-500",
		borderLeft: "border-l-orange-500",
		label: "OT",
	},
}

function resolveCategory(event: EquipmentTimelineEvent): EventCategory {
	if (event.type === TIMELINE_EVENT_TYPES.WORK_REQUEST) return "ST"
	if (event.parentPlanTaskId !== null) return "OT_PLAN"
	return "OT"
}

// ─── ST status pill (inline — no shared component yet) ───────────────────────

const WR_STATUS_CLASS: Record<string, string> = {
	REPORTED: "border-sky-500 bg-sky-500/10 text-sky-500",
	APPROVED: "border-blue-500 bg-blue-500/10 text-blue-500",
	ATTENDED: "border-emerald-600 bg-emerald-600/10 text-emerald-600",
	CANCELLED: "border-red-700 bg-red-700/10 text-red-700",
}

const WR_STATUS_LABEL: Record<string, string> = {
	REPORTED: "Reportada",
	APPROVED: "Aprobada",
	ATTENDED: "Atendida",
	CANCELLED: "Cancelada",
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface EquipmentTimelineEventProps {
	event: EquipmentTimelineEvent
	/** ST number lookup — used to show "Desde ST-XXX" badge on OTs */
	parentWorkRequestNumber: string | null
	onClickOT: (id: string) => void
	onClickST: (id: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EquipmentTimelineEventCard({
	event,
	parentWorkRequestNumber,
	onClickOT,
	onClickST,
}: EquipmentTimelineEventProps) {
	const category = resolveCategory(event)
	const style = CATEGORY_STYLE[category]
	const Icon = style.icon

	const isOT = event.type === TIMELINE_EVENT_TYPES.WORK_ORDER
	const formattedDate = format(new Date(event.date), "PPP", { locale: es })

	const handleClick = () => {
		if (isOT) onClickOT(event.id)
		else onClickST(event.id)
	}

	return (
		<div className="relative flex items-start py-3">
			{/* ── Node circle (sits on the axis) ─────────────────────────────── */}
			<div
				className={cn(
					"relative z-10 ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow ring-4 ring-background",
					style.nodeBg
				)}
				aria-hidden
			>
				<Icon className="h-5 w-5 text-white" />
			</div>

			{/* ── Horizontal connector ───────────────────────────────────────── */}
			<span className="mt-5 h-px w-8 shrink-0 bg-border" aria-hidden />

			{/* ── Card ───────────────────────────────────────────────────────── */}
			<div
				className={cn(
					"flex-1 cursor-pointer rounded-lg border border-l-4 bg-card p-4 shadow-sm transition-colors hover:bg-accent/50",
					style.borderLeft
				)}
				onClick={handleClick}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault()
						handleClick()
					}
				}}
			>
				{/* Header row — number + category + badges */}
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-sm font-semibold">
						{isOT ? event.otNumber : event.workRequestNumber}
					</span>

					<Badge variant="outline" className="h-5 text-[10px]">
						{style.label}
					</Badge>

					{/* OT-specific badges */}
					{isOT && (
						<>
							<WorkOrderTypeBadge type={event.workOrderType} className="h-5 text-[10px]" />
							<WorkOrderStatusBadge status={event.status} className="h-5 text-[10px]" />
							<WorkOrderPriorityBadge
								priority={event.priority}
								className="h-5 text-[10px]"
							/>
						</>
					)}

					{/* ST-specific badges */}
					{!isOT && (
						<>
							<Badge
								variant="outline"
								className={cn(
									"h-5 text-[10px]",
									WR_STATUS_CLASS[event.status] ??
										"border-muted bg-muted text-muted-foreground"
								)}
							>
								{WR_STATUS_LABEL[event.status] ?? event.status}
							</Badge>
							{event.isUrgent && (
								<Badge variant="destructive" className="h-5 gap-1 text-[10px]">
									<AlertTriangleIcon className="h-3 w-3" />
									Urgente
								</Badge>
							)}
						</>
					)}
				</div>

				{/* Title */}
				<p className="mt-2 text-sm font-medium leading-snug">{event.title}</p>

				{/* Origin row (OT only) */}
				{isOT && (
					<div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
						<LinkIcon className="h-3 w-3" />
						{event.parentWorkRequestId ? (
							<span>
								Desde{" "}
								<span className="font-medium text-foreground">
									{parentWorkRequestNumber ?? "solicitud"}
								</span>
							</span>
						) : event.planName ? (
							<span>
								Plan:{" "}
								<span className="font-medium text-foreground">{event.planName}</span>
							</span>
						) : (
							<span>Ad-hoc</span>
						)}
					</div>
				)}

				{/* Meta row */}
				<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
					<time dateTime={event.date}>{formattedDate}</time>

					{event.responsible && (
						<span className="inline-flex items-center gap-1">
							<UserIcon className="h-3 w-3" />
							<span className="max-w-[160px] truncate">{event.responsible.name}</span>
						</span>
					)}

					{isOT && event.counts && (
						<span>
							{event.counts.milestones} hito
							{event.counts.milestones !== 1 ? "s" : ""} ·{" "}
							{event.counts.workEntries} actividad
							{event.counts.workEntries !== 1 ? "es" : ""}
						</span>
					)}
				</div>
			</div>
		</div>
	)
}
