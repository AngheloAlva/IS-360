"use client"

import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { toast } from "sonner"
import { DownloadIcon, Loader2Icon, X } from "lucide-react"

import { CalendarDateRangePicker } from "@/shared/components/ui/date-range-picker"
import { SelectWithSearch } from "@/shared/components/forms/SelectWithSearch"
import { TreeSelect } from "@/shared/components/forms/TreeSelect"
import { Button } from "@/shared/components/ui/button"
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip"

import {
	useKpiFilters,
	useKpiFilterActions,
} from "@/project/maintenance-plan/stores/maintenance-kpi-filters.store"
import { useEquipmentTreeNodes } from "@/project/equipment/hooks/use-equipment-tree-nodes"
import { useMaintenancePlans } from "@/project/maintenance-plan/hooks/use-maintenance-plans"

// ─── Enum option lists ────────────────────────────────────────────────────────

const SPECIALTY_OPTIONS = [
	{ value: "ELECTRIC", label: "Eléctrica" },
	{ value: "MECHANIC", label: "Mecánica" },
	{ value: "INSTRUMENTATION_CONTROL", label: "Instrumentación y Control" },
	{ value: "HYDRAULIC", label: "Hidráulica" },
]

const TASK_TYPE_OPTIONS = [
	{ value: "CLEANING", label: "Limpieza" },
	{ value: "INSPECTION", label: "Inspección" },
	{ value: "LUBRICATION", label: "Lubricación" },
	{ value: "ADJUSTMENTS", label: "Ajustes" },
]

const EMPTY_OPTION = { value: "", label: "Todos" }

// ─── Component ────────────────────────────────────────────────────────────────

export default function MaintenanceKpiFilterBar() {
	const filters = useKpiFilters()
	const { setDateRange, setFilter, reset, clearAll } = useKpiFilterActions()

	const { nodes: equipmentNodes, isLoading: equipmentsLoading } = useEquipmentTreeNodes()
	const { data: plansData, isLoading: plansLoading } = useMaintenancePlans({
		page: 1,
		limit: 500,
		orderBy: "name",
		order: "asc",
	})
	const planOptions = [
		EMPTY_OPTION,
		...(plansData?.maintenancePlans?.map((p) => ({ value: p.id, label: p.name })) ?? []),
	]
	const [isExporting, setIsExporting] = useState(false)

	async function handleExport() {
		try {
			setIsExporting(true)
			const params = new URLSearchParams()
			if (filters.dateFrom) params.set("dateFrom", filters.dateFrom)
			if (filters.dateTo) params.set("dateTo", filters.dateTo)
			if (filters.specialty) params.set("specialty", filters.specialty)
			if (filters.taskType) params.set("taskType", filters.taskType)
			if (filters.equipmentId) params.set("equipmentId", filters.equipmentId)
			if (filters.maintenancePlanId) params.set("maintenancePlanId", filters.maintenancePlanId)
			const qs = params.toString()
			const res = await fetch(`/api/maintenance-plan/kpi/export${qs ? `?${qs}` : ""}`)
			if (!res.ok) throw new Error("Error al exportar")

			const blob = await res.blob()
			const today = new Date().toISOString().slice(0, 10)
			const url = URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download = `indicadores-mantenimiento-${today}.xlsx`
			a.click()
			URL.revokeObjectURL(url)

			toast.success("Exportación lista")
		} catch (err) {
			console.error(err)
			toast.error("No se pudo exportar. Intentá nuevamente.")
		} finally {
			setIsExporting(false)
		}
	}

	// Convert ISO strings ↔ DateRange for the picker
	const dateRangeValue: DateRange | null =
		filters.dateFrom && filters.dateTo
			? { from: new Date(filters.dateFrom), to: new Date(filters.dateTo) }
			: null

	function handleDateChange(range: DateRange | null) {
		if (!range) {
			setDateRange(null, null)
			return
		}
		setDateRange(
			range.from ? range.from.toISOString() : null,
			range.to ? range.to.toISOString() : null
		)
	}

	const hasActiveFilters =
		filters.dateFrom !== null ||
		filters.dateTo !== null ||
		filters.specialty !== null ||
		filters.taskType !== null ||
		filters.equipmentId !== null ||
		filters.maintenancePlanId !== null

	return (
		<div className="flex flex-wrap items-end gap-3">
			{/* Date range */}
			<div className="flex flex-col gap-1">
				<span className="text-muted-foreground text-xs font-medium">Período</span>
				<div className="flex items-center gap-1">
					<CalendarDateRangePicker value={dateRangeValue} onChange={handleDateChange} />
					{(filters.dateFrom || filters.dateTo) && (
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 shrink-0"
							onClick={() => setDateRange(null, null)}
							title="Sin filtro de fecha"
						>
							<X className="h-3.5 w-3.5" />
						</Button>
					)}
				</div>
			</div>

			{/* Specialty */}
			<div className="flex flex-col gap-1">
				<span className="text-muted-foreground text-xs font-medium">Especialidad</span>
				<SelectWithSearch
					value={filters.specialty ?? ""}
					options={[EMPTY_OPTION, ...SPECIALTY_OPTIONS]}
					placeholder="Todas"
					onChange={(val) =>
						setFilter("specialty", val === "" ? null : (val as typeof filters.specialty))
					}
					className="w-52"
				/>
			</div>

			{/* Task type */}
			<div className="flex flex-col gap-1">
				<span className="text-muted-foreground text-xs font-medium">Tipo de tarea</span>
				<SelectWithSearch
					value={filters.taskType ?? ""}
					options={[EMPTY_OPTION, ...TASK_TYPE_OPTIONS]}
					placeholder="Todos"
					onChange={(val) =>
						setFilter("taskType", val === "" ? null : (val as typeof filters.taskType))
					}
					className="w-44"
				/>
			</div>

			{/* Maintenance plan */}
			<div className="flex flex-col gap-1">
				<span className="text-muted-foreground text-xs font-medium">Plan de Mantenimiento</span>
				<SelectWithSearch
					value={filters.maintenancePlanId ?? ""}
					options={planOptions}
					placeholder={plansLoading ? "Cargando..." : "Todos"}
					onChange={(val) => setFilter("maintenancePlanId", val === "" ? null : val)}
					className="w-64"
				/>
			</div>

			{/* Equipment */}
			<div className="flex flex-col gap-1">
				<span className="text-muted-foreground text-xs font-medium">Equipo</span>
				<TreeSelect
					mode="single"
					nodes={equipmentNodes}
					placeholder="Todos"
					isLoading={equipmentsLoading}
					value={filters.equipmentId}
					onChange={(val) => setFilter("equipmentId", val)}
					className="w-56"
				/>
			</div>

			{/* Action buttons */}
			<div className="ml-auto flex gap-2">
				<Button variant="outline" size="sm" onClick={reset} title="Restablecer al mes actual">
					Mes actual
				</Button>
				{hasActiveFilters && (
					<Button variant="ghost" size="sm" onClick={clearAll}>
						Limpiar todo
					</Button>
				)}
				<TooltipProvider delayDuration={150}>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="default"
								size="sm"
								onClick={handleExport}
								disabled={isExporting}
								className="gap-2"
							>
								{isExporting ? (
									<Loader2Icon className="h-4 w-4 animate-spin" />
								) : (
									<DownloadIcon className="h-4 w-4" />
								)}
								Exportar Excel
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom" className="max-w-xs text-center">
							Exporta todos los datos usados en los cálculos (OTs, solicitudes y agregados)
							respetando los filtros actualmente aplicados.
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</div>
	)
}
