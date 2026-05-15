"use client"

import { addDays, format, startOfDay } from "date-fns"
import { useCallback, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import {
	ArrowLeft,
	ClockIcon,
	FilterIcon,
	FilterXIcon,
	CalendarIcon,
	Columns3Icon,
	ArrowDownAZIcon,
	ArrowDownZAIcon,
	ArrowDown10Icon,
	ArrowDown01Icon,
	FileSpreadsheetIcon,
} from "lucide-react"
import {
	useReactTable,
	getCoreRowModel,
	type OnChangeFn,
	type PaginationState,
} from "@tanstack/react-table"

import MaintenancePlanTaskDetailDialog from "@/project/maintenance-plan/components/dialogs/MaintenancePlanTaskDetailDialog"
import { MaintenancePlanTaskColumns } from "@/project/maintenance-plan/columns/maintenance-plan-task-columns"
import { TaskFrequencyLabels, TaskFrequencyOptions } from "@/lib/consts/task-frequency"
import { useDebounce } from "@/shared/hooks/useDebounce"
import {
	type MaintenancePlanTask,
	useMaintenancePlanTasks,
} from "@/project/maintenance-plan/hooks/use-maintenance-plans-tasks"

import { DataGridColumnVisibility } from "@/shared/components/data-grid/data-grid-column-visibility"
import { DataGridPagination } from "@/shared/components/data-grid/data-grid-pagination"
import { DataGrid, DataGridContainer } from "@/shared/components/data-grid/data-grid"
import { CalendarDateRangePicker } from "@/shared/components/ui/date-range-picker"
import { DataGridTable } from "@/shared/components/data-grid/data-grid-table"
import { Card, CardContent } from "@/shared/components/ui/card"
import RefreshButton from "@/shared/components/RefreshButton"
import SearchInput from "@/shared/components/SearchInput"
import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"
import {
	DataGridToolbar,
	DataGridActiveFilters,
	type DataGridActiveFilter,
} from "@/shared/components/data-grid/data-grid-toolbar"
import {
	DropdownMenu,
	DropdownMenuSub,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuRadioGroup,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
} from "@/shared/components/ui/dropdown-menu"

import type { DateRange } from "react-day-picker"
import type {
	MaintenanceTaskOrder,
	MaintenanceTaskOrderBy,
} from "@/project/maintenance-plan/components/data/MaintenanceTaskOrderByButton"

interface MaintenancePlanTaskTableProps {
	planSlug: string
	userId: string
	hasPermission?: boolean
}

type DateRangeFilter = "all" | "overdue" | "next-7" | "next-30"
type AutomationFilter = "all" | "automated" | "manual"

const SORT_OPTIONS: {
	value: `${MaintenanceTaskOrderBy}-${MaintenanceTaskOrder}`
	label: string
}[] = [
	{ value: "name-asc", label: "Nombre Asc." },
	{ value: "name-desc", label: "Nombre Desc." },
	{ value: "nextDate-asc", label: "Próxima ejecución Asc." },
	{ value: "nextDate-desc", label: "Próxima ejecución Desc." },
	{ value: "frequency-asc", label: "Frecuencia Asc." },
	{ value: "frequency-desc", label: "Frecuencia Desc." },
	{ value: "createdAt-asc", label: "Fecha de creación Asc." },
	{ value: "createdAt-desc", label: "Fecha de creación Desc." },
]

const DATE_RANGE_LABEL: Record<DateRangeFilter, string> = {
	"all": "Todas",
	"overdue": "Vencidas",
	"next-7": "Próximos 7 días",
	"next-30": "Próximos 30 días",
}

const AUTOMATION_FILTER_LABEL: Record<AutomationFilter, string> = {
	all: "Todas",
	automated: "Solo automatizadas",
	manual: "Solo manuales",
}

export function MaintenancePlanTaskTable({
	planSlug,
	userId,
	hasPermission = false,
}: MaintenancePlanTaskTableProps) {
	const searchParams = useSearchParams()
	const parentId = searchParams.get("parentId")

	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(15)
	const [search, setSearch] = useState("")
	const [frequency, setFrequency] = useState("")
	const [orderBy, setOrderBy] = useState<MaintenanceTaskOrderBy>("name")
	const [order, setOrder] = useState<MaintenanceTaskOrder>("asc")
	const [isAutomatedFilter, setIsAutomatedFilter] = useState<AutomationFilter>("all")
	const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>("all")
	const [customDateRange, setCustomDateRange] = useState<DateRange | null>(null)
	const [exportLoading, setExportLoading] = useState<boolean>(false)
	const [selectedTask, setSelectedTask] = useState<MaintenancePlanTask | null>(null)

	const debouncedSearch = useDebounce(search)

	const dateFilterValues = useMemo(() => {
		const now = startOfDay(new Date())

		if (customDateRange?.from || customDateRange?.to) {
			return {
				nextDateFrom: customDateRange?.from
					? format(startOfDay(customDateRange.from), "yyyy-MM-dd")
					: "",
				nextDateTo: customDateRange?.to ? format(startOfDay(customDateRange.to), "yyyy-MM-dd") : "",
			}
		}

		if (dateRangeFilter === "overdue") {
			return {
				nextDateFrom: "",
				nextDateTo: format(addDays(now, -1), "yyyy-MM-dd"),
			}
		}

		if (dateRangeFilter === "next-7") {
			return {
				nextDateFrom: format(now, "yyyy-MM-dd"),
				nextDateTo: format(addDays(now, 7), "yyyy-MM-dd"),
			}
		}

		if (dateRangeFilter === "next-30") {
			return {
				nextDateFrom: format(now, "yyyy-MM-dd"),
				nextDateTo: format(addDays(now, 30), "yyyy-MM-dd"),
			}
		}

		return {
			nextDateFrom: "",
			nextDateTo: "",
		}
	}, [customDateRange, dateRangeFilter])

	const { data, isLoading, refetch, isFetching } = useMaintenancePlanTasks({
		page,
		search: debouncedSearch,
		planSlug,
		frequency,
		isAutomated: isAutomatedFilter,
		nextDateFrom: dateFilterValues.nextDateFrom,
		nextDateTo: dateFilterValues.nextDateTo,
		order,
		orderBy,
		limit: pageSize,
	})

	const columns = useMemo(
		() =>
			MaintenancePlanTaskColumns({
				userId,
				maintenancePlanSlug: planSlug,
			}),
		[planSlug, userId]
	)

	const handlePaginationChange: OnChangeFn<PaginationState> = useCallback(
		(updater) => {
			const currentPagination = {
				pageIndex: page - 1,
				pageSize,
			}

			const nextPagination = typeof updater === "function" ? updater(currentPagination) : updater

			if (nextPagination.pageSize !== currentPagination.pageSize) {
				setPageSize(nextPagination.pageSize)
				setPage(1)
			}

			if (nextPagination.pageIndex !== currentPagination.pageIndex) {
				setPage(nextPagination.pageIndex + 1)
			}
		},
		[page, pageSize]
	)

	const table = useReactTable<MaintenancePlanTask>({
		data: data?.tasks ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		state: {
			pagination: {
				pageIndex: page - 1,
				pageSize,
			},
		},
		onPaginationChange: handlePaginationChange,
		manualPagination: true,
		enableColumnPinning: true,
		columnResizeMode: "onChange",
		pageCount: data?.pages ?? 0,
	})

	const selectedSort = `${orderBy}-${order}` as `${MaintenanceTaskOrderBy}-${MaintenanceTaskOrder}`

	const activeFilters = useMemo<DataGridActiveFilter[]>(
		() =>
			[
				search
					? {
							key: "search",
							label: `Busqueda: ${search}`,
							onClear: () => setSearch(""),
						}
					: null,
				frequency
					? {
							key: "frequency",
							label: `Frecuencia: ${TaskFrequencyLabels[frequency as keyof typeof TaskFrequencyLabels]}`,
							onClear: () => setFrequency(""),
						}
					: null,
				isAutomatedFilter !== "all"
					? {
							key: "automation",
							label: `Automatización: ${AUTOMATION_FILTER_LABEL[isAutomatedFilter]}`,
							onClear: () => setIsAutomatedFilter("all"),
						}
					: null,
				dateRangeFilter !== "all"
					? {
							key: "dateRange",
							label: `Fecha: ${DATE_RANGE_LABEL[dateRangeFilter]}`,
							onClear: () => setDateRangeFilter("all"),
						}
					: null,
				customDateRange?.from
					? {
							key: "customDate",
							label: `Rango: ${format(customDateRange.from, "dd/MM/yyyy")}${customDateRange.to ? ` - ${format(customDateRange.to, "dd/MM/yyyy")}` : ""}`,
							onClear: () => setCustomDateRange(null),
						}
					: null,
			].filter((value): value is DataGridActiveFilter => value !== null),
		[customDateRange, dateRangeFilter, frequency, isAutomatedFilter, search]
	)

	const handleExportToExcel = useCallback(async () => {
		try {
			setExportLoading(true)

			const res: { tasks: MaintenancePlanTask[] } = await fetch(
				`/api/maintenance-plan/${planSlug}/tasks?page=1&limit=10000`
			).then((response) => response.json())

			if (!res?.tasks?.length) {
				toast.error("No hay tareas para exportar")
				return
			}

			const XLSX = await import("xlsx")
			const workbook = XLSX.utils.book_new()

			const tasksSheet = XLSX.utils.json_to_sheet(
				res.tasks.map((task) => {
					const equipments = task.equipments.length > 0 ? task.equipments : [task.equipment]
					const locations = [...new Set(equipments.map((equipment) => equipment.location?.path ?? ""))]

					return {
						"Nombre de la Tarea": task.name,
						"Descripción": task.description || "N/A",
						"Equipos": equipments.map((equipment) => equipment.name).join(", ") || "N/A",
						"Ubicación de Equipos": locations.join(", ") || "N/A",
						"Frecuencia": TaskFrequencyLabels[task.frequency] || "N/A",
						"Próxima Ejecución": task.nextDate
							? format(new Date(task.nextDate), "dd/MM/yyyy", { locale: es })
							: "N/A",
						"OTs Creadas": task._count?.workOrders || 0,
						"Es Automatizada": task.isAutomated ? "Sí" : "No",
						"Supervisor Automatizado": task.automatedSupervisorId ? "Configurado" : "N/A",
						"Tipo OT Automatizada": task.automatedWorkOrderType || "N/A",
						"Prioridad Automatizada": task.automatedPriority || "N/A",
						"CAPEX Automatizado": task.automatedCapex || "N/A",
						"Días Estimados": task.automatedEstimatedDays || "N/A",
						"Horas Estimadas": task.automatedEstimatedHours || "N/A",
						"Descripción Trabajo": task.automatedWorkDescription || "N/A",
						"Emails de Copia": task.emailsForCopy?.join(", ") || "N/A",
						"Adjuntos":
							task.attachments?.map((attachment) => attachment.name).join(", ") || "Sin adjuntos",
						"Creado por": task.createdBy?.name || "N/A",
						"Fecha de Creación": task.createdAt
							? format(new Date(task.createdAt), "dd/MM/yyyy", { locale: es })
							: "N/A",
					}
				})
			)

			XLSX.utils.book_append_sheet(workbook, tasksSheet, "Tareas de Mantenimiento")

			const fileName = `tareas-mantenimiento-${planSlug}.xlsx`
			XLSX.writeFile(workbook, fileName)
			toast.success("Tareas de mantenimiento exportadas exitosamente")
		} catch (error) {
			console.error("[EXPORT_TASKS_EXCEL]", error)
			toast.error("Error al exportar tareas de mantenimiento")
		} finally {
			setExportLoading(false)
		}
	}, [planSlug])

	const resetFilters = () => {
		setSearch("")
		setFrequency("")
		setIsAutomatedFilter("all")
		setDateRangeFilter("all")
		setCustomDateRange(null)
		setOrderBy("name")
		setOrder("asc")
		setPage(1)
	}

	return (
		<div className="space-y-3">
			{parentId && (
				<Button
					variant="ghost"
					onClick={() => {
						window.location.href = "/admin/dashboard/equipos"
					}}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Volver a Equipos Principales
				</Button>
			)}

			<DataGridToolbar>
				<div className="flex w-full flex-col items-end gap-2 sm:flex-row sm:flex-wrap">
					<SearchInput
						value={search}
						setPage={setPage}
						onChange={setSearch}
						className="w-full lg:w-80"
						inputClassName="h-9 bg-background"
						iconClassName="top-4.5"
						placeholder="Buscar por nombre o equipo..."
					/>

					<CalendarDateRangePicker
						value={customDateRange}
						onChange={(nextRange) => {
							setCustomDateRange(nextRange)
							if (nextRange?.from || nextRange?.to) {
								setDateRangeFilter("all")
							}
							setPage(1)
						}}
					/>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="lg">
								<FilterIcon className="size-4" />
								Filtros
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-64" align="start">
							<DropdownMenuLabel>Filtros de tabla</DropdownMenuLabel>
							<DropdownMenuSeparator />

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									<ClockIcon className="size-4" />
									Frecuencia
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-56">
									<DropdownMenuRadioGroup
										value={frequency || "all"}
										onValueChange={(value) => {
											setFrequency(value === "all" ? "" : value)
											setPage(1)
										}}
									>
										<DropdownMenuRadioItem value="all">Todas</DropdownMenuRadioItem>
										{TaskFrequencyOptions.map((option) => (
											<DropdownMenuRadioItem key={option.value} value={option.value}>
												{option.label}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Automatización</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-56">
									<DropdownMenuRadioGroup
										value={isAutomatedFilter}
										onValueChange={(value) => {
											setIsAutomatedFilter(value as AutomationFilter)
											setPage(1)
										}}
									>
										{Object.entries(AUTOMATION_FILTER_LABEL).map(([value, label]) => (
											<DropdownMenuRadioItem key={value} value={value}>
												{label}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									<CalendarIcon className="size-4" />
									Rango de fechas
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-56">
									<DropdownMenuRadioGroup
										value={dateRangeFilter}
										onValueChange={(value) => {
											setDateRangeFilter(value as DateRangeFilter)
											setCustomDateRange(null)
											setPage(1)
										}}
									>
										<DropdownMenuRadioItem value="all">Todas</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="overdue">Vencidas</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="next-7">Próximos 7 días</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="next-30">Próximos 30 días</DropdownMenuRadioItem>
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Orden</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-64">
									<DropdownMenuRadioGroup
										value={selectedSort}
										onValueChange={(value) => {
											const [nextOrderBy, nextOrder] = value.split("-") as [
												MaintenanceTaskOrderBy,
												MaintenanceTaskOrder,
											]
											setOrderBy(nextOrderBy)
											setOrder(nextOrder)
											setPage(1)
										}}
									>
										{SORT_OPTIONS.map((option) => {
											const icon =
												option.value === "name-asc"
													? ArrowDownAZIcon
													: option.value === "name-desc"
														? ArrowDownZAIcon
														: option.value === "createdAt-asc"
															? ArrowDown10Icon
															: ArrowDown01Icon
											const Icon = icon

											return (
												<DropdownMenuRadioItem key={option.value} value={option.value}>
													<Icon className="size-4" />
													{option.label}
												</DropdownMenuRadioItem>
											)
										})}
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>
						</DropdownMenuContent>
					</DropdownMenu>

					<div className="ml-auto flex items-center justify-end gap-2">
						<RefreshButton refetch={refetch} isFetching={isFetching} size="md" />

						<DataGridColumnVisibility
							table={table}
							trigger={
								<Button size="icon" variant="outline" className="size-9">
									<Columns3Icon className="size-4" />
								</Button>
							}
						/>

						<Button
							size="icon"
							variant="outline"
							onClick={resetFilters}
							className="size-9 text-purple-600 hover:bg-purple-600 hover:text-white"
						>
							<FilterXIcon className="size-4" />
						</Button>

						{hasPermission && (
							<Button
								size="lg"
								variant="outline"
								onClick={handleExportToExcel}
								className="text-green-600 hover:bg-green-700"
							>
								{exportLoading ? <Spinner /> : <FileSpreadsheetIcon className="h-4 w-4" />}
								Exportar
							</Button>
						)}
					</div>
				</div>

				<DataGridActiveFilters filters={activeFilters} />
			</DataGridToolbar>

			<Card>
				<CardContent className="flex w-full flex-col items-start gap-4">
					<DataGrid<MaintenancePlanTask>
						table={table}
						onRowClick={(row) => setSelectedTask(row)}
						recordCount={data?.total ?? 0}
						isLoading={isLoading || isFetching}
						emptyMessage="No hay tareas asignadas"
						tableLayout={{
							columnsVisibility: true,
							columnsResizable: true,
							columnsPinnable: true,
							width: "fixed",
						}}
					>
						<DataGridContainer border={false} className="w-full overflow-x-auto">
							<DataGridTable<MaintenancePlanTask> />
						</DataGridContainer>
						<DataGridPagination
							rowsPerPageLabel="Filas por pagina"
							previousPageLabel="Pagina anterior"
							nextPageLabel="Pagina siguiente"
							info="{from} - {to} de {count}"
						/>
					</DataGrid>

					<MaintenancePlanTaskDetailDialog
						open={selectedTask !== null}
						task={selectedTask}
						onOpenChange={(open) => {
							if (!open) {
								setSelectedTask(null)
							}
						}}
						planSlug={planSlug}
						userId={userId}
					/>
				</CardContent>
			</Card>
		</div>
	)
}
