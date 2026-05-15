"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { FILTER_KINDS, type FilterKind } from "@/project/equipment/lib/group-timeline-events"

// ─── Config ───────────────────────────────────────────────────────────────────

interface FilterChipConfig {
	kind: FilterKind
	label: string
	/** Tailwind border + background tints when active */
	activeClass: string
}

const FILTER_CHIPS: FilterChipConfig[] = [
	{
		kind: FILTER_KINDS.ST,
		label: "Solicitudes",
		activeClass: "border-sky-400 bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
	},
	{
		kind: FILTER_KINDS.CORRECTIVE,
		label: "OT Correctivas",
		activeClass: "border-red-400 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300",
	},
	{
		kind: FILTER_KINDS.PREVENTIVE,
		label: "OT Preventivas",
		activeClass: "border-blue-400 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
	},
	{
		kind: FILTER_KINDS.PREDICTIVE,
		label: "OT Predictivas",
		activeClass: "border-purple-400 bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300",
	},
	{
		kind: FILTER_KINDS.PROACTIVE,
		label: "OT Proactivas",
		activeClass: "border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
	},
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface EquipmentTimelineFiltersProps {
	/** Set of HIDDEN filter kinds — empty means "show all" */
	hiddenFilters: Set<FilterKind>
	onChange: (next: Set<FilterKind>) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EquipmentTimelineFilters({ hiddenFilters, onChange }: EquipmentTimelineFiltersProps) {
	function toggleChip(kind: FilterKind) {
		const next = new Set(hiddenFilters)
		if (next.has(kind)) {
			next.delete(kind)
		} else {
			next.add(kind)
		}
		onChange(next)
	}

	function clearAll() {
		onChange(new Set())
	}

	return (
		<div className="flex flex-wrap items-center gap-2">
			{FILTER_CHIPS.map(({ kind, label, activeClass }) => {
				const isActive = !hiddenFilters.has(kind)

				return (
					<button
						key={kind}
						type="button"
						onClick={() => toggleChip(kind)}
						className={cn(
							"inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
							isActive
								? activeClass
								: "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60"
						)}
					>
						{label}
					</button>
				)
			})}

			{hiddenFilters.size > 0 && (
				<Button
					variant="ghost"
					size="sm"
					onClick={clearAll}
					className="h-7 px-2 text-xs text-muted-foreground"
				>
					Limpiar filtros
				</Button>
			)}
		</div>
	)
}
