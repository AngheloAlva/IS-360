"use client"

import { useState } from "react"
import { format } from "date-fns"
import { DownloadIcon, RefreshCwIcon, AlertTriangleIcon } from "lucide-react"
import { toast } from "sonner"

import { useKpiDrillDown, fetchDrillDownExport } from "@/project/maintenance-plan/hooks/use-kpi-drill-down"
import {
	useKpiDrillDownState,
	useKpiDrillDownActions,
} from "@/project/maintenance-plan/stores/kpi-drill-down.store"
import { useKpiFilters } from "@/project/maintenance-plan/stores/maintenance-kpi-filters.store"
import { getColumns } from "./columns"
import { DrillDownTable } from "./DrillDownTable"
import type { DrillDownRow, DrillDownSegment } from "@/project/maintenance-plan/types/kpi-drill-down"

import WorkOrderDetailsDialog from "@/project/work-order/components/dialogs/WorkOrderDetailsDialog"

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/shared/components/ui/sheet"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"

// ─── CSV export cap (user-confirmed) ─────────────────────────────────────────

const CSV_EXPORT_CAP = 2000

// ─── Title mapping ────────────────────────────────────────────────────────────

function getSheetTitle(segment: DrillDownSegment | null): string {
	if (segment === "on-time:late") return "OTs Atrasadas"
	if (segment === "on-time:ontime") return "OTs En Fecha"
	return "OTs"
}

// ─── CSV builder ──────────────────────────────────────────────────────────────

function buildCsv(rows: DrillDownRow[]): string {
	const header = [
		"OT",
		"Equipo",
		"Fecha Est. Fin",
		"Fecha Real Fin",
		"Días Atraso",
		"Especialidad",
		"Responsable",
		"Sin Actividad",
	].join(",")

	const dataRows = rows.map((r) => {
		const safe = (v: string | null | undefined) =>
			v ? `"${String(v).replace(/"/g, '""')}"` : ""

		return [
			safe(r.code),
			safe(r.equipmentName),
			safe(r.scheduledDate ? r.scheduledDate.substring(0, 10) : null),
			safe(r.endDate ? r.endDate.substring(0, 10) : null),
			String(r.delayDays),
			safe(r.specialty),
			safe(r.responsibleName),
			r.hasNoActivity ? "Sí" : "No",
		].join(",")
	})

	return [header, ...dataRows].join("\n")
}

function downloadCsv(content: string, filename: string) {
	const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
	const url = URL.createObjectURL(blob)
	const a = document.createElement("a")
	a.href = url
	a.download = filename
	a.click()
	URL.revokeObjectURL(url)
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function KpiDrillDownSheet() {
	const { segment, open, page, sortBy, sortDir } = useKpiDrillDownState()
	// pageSize is fixed at 50 for the sheet table
	const PAGE_SIZE = 50
	const { close } = useKpiDrillDownActions()
	const filters = useKpiFilters()

	const { data, isLoading, isError, refetch, isFetching } = useKpiDrillDown({
		pageSize: PAGE_SIZE,
	})

	const [selectedWoId, setSelectedWoId] = useState<string | null>(null)
	const [csvLoading, setCsvLoading] = useState(false)

	const columns = segment ? getColumns(segment) : []
	const title = getSheetTitle(segment)
	const total = data?.total ?? 0
	const items = data?.items ?? []

	async function handleExport() {
		if (!segment) return

		setCsvLoading(true)
		try {
			const exportData = await fetchDrillDownExport(segment, filters, sortBy, sortDir)
			const rows = exportData.items

			if (exportData.total > CSV_EXPORT_CAP) {
				toast.warning(`Export limitado a ${CSV_EXPORT_CAP} filas`)
			}

			const segmentSlug = segment.replace(":", "-")
			const dateStr = format(new Date(), "yyyy-MM-dd")
			const filename = `${segmentSlug}-${dateStr}.csv`

			downloadCsv(buildCsv(rows), filename)
		} catch {
			toast.error("Error al exportar CSV")
		} finally {
			setCsvLoading(false)
		}
	}

	return (
		<>
			<Sheet open={open} onOpenChange={(isOpen) => !isOpen && close()}>
				<SheetContent
					side="right"
					className="flex w-full flex-col gap-0 p-0 sm:max-w-4xl"
				>
					{/* Header */}
					<SheetHeader className="border-b px-6 py-4">
						<div className="flex items-center justify-between gap-4">
							<div className="flex flex-col gap-0.5">
								<SheetTitle>{title}</SheetTitle>
								<SheetDescription>
									{isLoading
										? "Cargando órdenes de trabajo..."
										: `${total} órdenes de trabajo`}
								</SheetDescription>
							</div>

							<Button
								variant="outline"
								size="sm"
								onClick={handleExport}
								disabled={csvLoading || isLoading || total === 0}
								className="shrink-0"
							>
								<DownloadIcon className="mr-2 size-4" />
								{csvLoading ? "Exportando..." : "Exportar CSV"}
							</Button>
						</div>
					</SheetHeader>

					{/* Body */}
					<div className="flex-1 overflow-y-auto px-6 py-4">
						{isLoading ? (
							// Loading skeleton
							<div className="flex flex-col gap-2">
								{Array.from({ length: 8 }).map((_, i) => (
									<Skeleton key={i} className="h-10 w-full rounded-md" />
								))}
							</div>
						) : isError ? (
							// Error state
							<div className="flex flex-col items-center gap-4 py-12 text-center">
								<AlertTriangleIcon className="text-destructive size-10" />
								<p className="text-muted-foreground text-sm">
									Ocurrió un error al cargar los datos.
								</p>
								<Button variant="outline" size="sm" onClick={() => refetch()}>
									<RefreshCwIcon className="mr-2 size-4" />
									Reintentar
								</Button>
							</div>
						) : total === 0 ? (
							// Empty state
							<div className="flex flex-col items-center gap-2 py-12 text-center">
								<p className="text-muted-foreground text-sm">
									No hay OTs para este segmento
								</p>
								<p className="text-muted-foreground text-xs">
									Intenta ajustar los filtros de fecha o especialidad
								</p>
							</div>
						) : segment ? (
							// Data table
							<DrillDownTable
								rows={items}
								total={total}
								page={page}
								pageSize={PAGE_SIZE}
								sortBy={sortBy}
								sortDir={sortDir}
								isLoading={isFetching}
								columns={columns}
								onRowClick={(row) => setSelectedWoId(row.id)}
							/>
						) : null}
					</div>
				</SheetContent>
			</Sheet>

			{/* WorkOrderDetailsDialog — mounted inside / behind sheet */}
			{selectedWoId && (
				<WorkOrderDetailsDialog
					open={!!selectedWoId}
					workOrderId={selectedWoId}
					setOpen={(isOpen) => {
						if (!isOpen) setSelectedWoId(null)
					}}
				/>
			)}
		</>
	)
}
