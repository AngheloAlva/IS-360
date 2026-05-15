"use client"

import { useMemo, useState } from "react"
import { HistoryIcon, Loader2Icon, CircleDotIcon, FlagIcon } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"

import { useEquipmentTimeline } from "@/project/equipment/hooks/use-equipment-timeline"
import {
	filterTimelineEvents,
	type FilterKind,
} from "@/project/equipment/lib/group-timeline-events"
import {
	TIMELINE_EVENT_TYPES,
	type EquipmentTimelineEvent,
} from "@/project/equipment/types/equipment-timeline"

import { WorkOrderSummaryDrawer } from "@/project/work-order/components/dialogs/WorkOrderSummaryDrawer"
import WorkRequestDetailsDialog from "@/project/work-request/components/dialogs/WorkRequestDetailsDialog"

import { EquipmentTimelineFilters } from "./EquipmentTimelineFilters"
import { EquipmentTimelineEventCard } from "./EquipmentTimelineEvent"

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Builds a Map<workRequestId, workRequestNumber> so OT cards can show their parent ST number */
function buildWorkRequestNumberLookup(
	events: EquipmentTimelineEvent[]
): Map<string, string> {
	const map = new Map<string, string>()
	for (const event of events) {
		if (event.type === TIMELINE_EVENT_TYPES.WORK_REQUEST) {
			map.set(event.id, event.workRequestNumber)
		}
	}
	return map
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function TimelineSkeleton() {
	return (
		<div className="relative pt-2">
			{/* Axis mock */}
			<span
				className="pointer-events-none absolute bottom-0 left-6 top-0 w-px bg-border"
				aria-hidden
			/>
			<div className="space-y-5">
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={i} className="flex items-start py-2">
						<Skeleton className="ml-1 h-10 w-10 shrink-0 rounded-full" />
						<span className="mt-5 h-px w-8 shrink-0 bg-border" />
						<Skeleton className="h-24 flex-1 rounded-lg" />
					</div>
				))}
			</div>
		</div>
	)
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function TimelineEmpty() {
	return (
		<div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
			<HistoryIcon className="h-10 w-10 text-muted-foreground/40" />
			<p className="text-sm text-muted-foreground">
				No hay eventos registrados para este equipo
			</p>
		</div>
	)
}

// ─── Timeline endpoint marker (Hoy / Inicio) ─────────────────────────────────

function TimelineEndpointMarker({
	label,
	variant,
}: {
	label: string
	variant: "now" | "start"
}) {
	const Icon = variant === "now" ? CircleDotIcon : FlagIcon
	return (
		<div className="relative flex items-center py-2">
			<div
				className="relative z-10 ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-border bg-background"
				aria-hidden
			>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</div>
			<span className="mt-0 h-px w-8 shrink-0 bg-border" aria-hidden />
			<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
				{label}
			</span>
		</div>
	)
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface EquipmentTimelineProps {
	equipmentId: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EquipmentTimeline({ equipmentId }: EquipmentTimelineProps) {
	const [hiddenFilters, setHiddenFilters] = useState<Set<FilterKind>>(new Set())

	// Drawer state — opened OT id
	const [drawerState, setDrawerState] = useState<{
		open: boolean
		workOrderId: string | null
	}>({
		open: false,
		workOrderId: null,
	})

	// Dialog state — opened ST id
	const [stDialogState, setStDialogState] = useState<{
		open: boolean
		workRequestId: string | null
	}>({
		open: false,
		workRequestId: null,
	})

	const {
		data,
		isLoading,
		isError,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
	} = useEquipmentTimeline(equipmentId)

	// Flatten pages — already sorted DESC by the API
	const flatEvents = useMemo(
		() => data?.pages.flatMap((page) => page.events) ?? [],
		[data]
	)

	// Apply filters (grouping removed — timeline is now a flat axis)
	const visibleEvents = useMemo(
		() => filterTimelineEvents(flatEvents, hiddenFilters),
		[flatEvents, hiddenFilters]
	)

	// Build ST number lookup so OT cards can reference their parent ST by number
	const wrNumberLookup = useMemo(
		() => buildWorkRequestNumberLookup(flatEvents),
		[flatEvents]
	)

	function handleClickOT(id: string) {
		setDrawerState({ open: true, workOrderId: id })
	}

	function handleClickST(id: string) {
		setStDialogState({ open: true, workRequestId: id })
	}

	// ── Loading state ──────────────────────────────────────────────────────────
	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-64 rounded-full" />
				<TimelineSkeleton />
			</div>
		)
	}

	// ── Error state ────────────────────────────────────────────────────────────
	if (isError) {
		return (
			<div className="flex flex-col items-center gap-3 py-12 text-center">
				<p className="text-sm text-destructive">
					Error al cargar el historial del equipo.
				</p>
				<Button variant="outline" size="sm" onClick={() => refetch()}>
					Reintentar
				</Button>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			{/* Filter chips */}
			<EquipmentTimelineFilters hiddenFilters={hiddenFilters} onChange={setHiddenFilters} />

			{visibleEvents.length === 0 ? (
				<TimelineEmpty />
			) : (
				<div className="relative">
					{/* Central axis — absolute positioned spine running top to bottom */}
					<span
						className="pointer-events-none absolute bottom-0 left-6 top-0 w-px bg-border"
						aria-hidden
					/>

					{/* Top marker — "Hoy" */}
					<TimelineEndpointMarker label="Hoy" variant="now" />

					{/* Events (newest first) */}
					{visibleEvents.map((event) => (
						<EquipmentTimelineEventCard
							key={event.id}
							event={event}
							parentWorkRequestNumber={
								event.type === TIMELINE_EVENT_TYPES.WORK_ORDER &&
								event.parentWorkRequestId
									? (wrNumberLookup.get(event.parentWorkRequestId) ?? null)
									: null
							}
							onClickOT={handleClickOT}
							onClickST={handleClickST}
						/>
					))}

					{/* Load more */}
					{hasNextPage ? (
						<div className="relative flex justify-center py-4">
							<Button
								variant="outline"
								size="sm"
								onClick={() => fetchNextPage()}
								disabled={isFetchingNextPage}
							>
								{isFetchingNextPage ? (
									<>
										<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
										Cargando...
									</>
								) : (
									"Cargar más antiguos"
								)}
							</Button>
						</div>
					) : (
						<TimelineEndpointMarker
							label="Inicio del historial"
							variant="start"
						/>
					)}
				</div>
			)}

			<WorkOrderSummaryDrawer
				workOrderId={drawerState.workOrderId}
				open={drawerState.open}
				onOpenChange={(open) => setDrawerState((prev) => ({ ...prev, open }))}
			/>

			{stDialogState.workRequestId && (
				<WorkRequestDetailsDialog
					workRequestId={stDialogState.workRequestId}
					open={stDialogState.open}
					onOpenChange={(open) => setStDialogState((prev) => ({ ...prev, open }))}
				/>
			)}
		</div>
	)
}
