import { createElement } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { ColumnDef } from "@tanstack/react-table"

import type { DrillDownRow, DrillDownSegment } from "@/project/maintenance-plan/types/kpi-drill-down"
import { SeverityBadge } from "./SeverityBadge"

// ─── Shared columns ────────────────────────────────────────────────────────────

const baseColumns: ColumnDef<DrillDownRow>[] = [
	{
		accessorKey: "code",
		header: "OT",
		size: 140,
		cell: ({ row }) => row.original.code,
	},
	{
		accessorKey: "equipmentName",
		header: "Equipo",
		size: 200,
		cell: ({ row }) => row.original.equipmentName ?? "—",
	},
	{
		accessorKey: "scheduledDate",
		header: "Fecha Est. Fin",
		size: 140,
		cell: ({ row }) => {
			const d = row.original.scheduledDate
			if (!d) return "—"
			try {
				return format(new Date(d), "dd/MM/yyyy", { locale: es })
			} catch {
				return d
			}
		},
	},
	{
		accessorKey: "endDate",
		header: "Fecha Real Fin",
		size: 140,
		cell: ({ row }) => {
			const d = row.original.endDate
			if (!d) return "—"
			try {
				return format(new Date(d), "dd/MM/yyyy", { locale: es })
			} catch {
				return d
			}
		},
	},
	{
		accessorKey: "delayDays",
		header: "Atraso",
		size: 130,
		cell: ({ row }) => createElement(SeverityBadge, { delayDays: row.original.delayDays }),
	},
	{
		accessorKey: "specialty",
		header: "Especialidad",
		size: 160,
		cell: ({ row }) => row.original.specialty ?? "—",
	},
	{
		accessorKey: "responsibleName",
		header: "Responsable",
		size: 180,
		cell: ({ row }) => row.original.responsibleName ?? "—",
	},
	{
		accessorKey: "hasNoActivity",
		header: "Sin Actividad",
		size: 130,
		cell: ({ row }) =>
			row.original.hasNoActivity
				? createElement(
						"span",
						{
							className:
								"inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200",
						},
						"Sin actividad"
					)
				: createElement("span", { className: "text-muted-foreground" }, "—"),
	},
]

// ─── Public factory ────────────────────────────────────────────────────────────

/**
 * Returns column definitions for the given segment family.
 * Extension point: add segment-specific overrides here when new segments land.
 */
export function getColumns(_segment: DrillDownSegment): ColumnDef<DrillDownRow>[] {
	// All current segments share the same WO-backed column set.
	// When non-WO segments are added, switch on segment family here.
	return baseColumns
}
