"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { toast } from "sonner"
import {
	FilterIcon,
	FilterXIcon,
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

import { MaintenancePlanColumns } from "@/project/maintenance-plan/columns/maintenance-plan-columns"
import { useDebounce } from "@/shared/hooks/useDebounce"
import {
	type MaintenancePlan,
	useMaintenancePlans,
} from "@/project/maintenance-plan/hooks/use-maintenance-plans"

import { DataGridColumnVisibility } from "@/shared/components/data-grid/data-grid-column-visibility"
import { DataGridPagination } from "@/shared/components/data-grid/data-grid-pagination"
import { DataGrid, DataGridContainer } from "@/shared/components/data-grid/data-grid"
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

import { type Order, type OrderBy } from "@/shared/components/OrderByButton"

interface MaintenancePlanTableProps {
	id: string
	userId: string
	hasPermission: boolean
}

type AlertFilter = "all" | "withOverdue" | "withUpcoming" | "withAlerts" | "withoutAlerts"

const ALERT_FILTER_LABEL: Record<AlertFilter, string> = {
	all: "Todas",
	withOverdue: "Con tareas vencidas",
	withUpcoming: "Con tareas próximas (7 días)",
	withAlerts: "Con alertas",
	withoutAlerts: "Sin alertas",
}

const SORT_OPTIONS: { value: `${OrderBy}-${Order}`; label: string }[] = [
	{ value: "name-asc", label: "Nombre Asc." },
	{ value: "name-desc", label: "Nombre Desc." },
	{ value: "createdAt-asc", label: "Fecha de creación Asc." },
	{ value: "createdAt-desc", label: "Fecha de creación Desc." },
]

export function MaintenancePlanTable({ id, userId, hasPermission }: MaintenancePlanTableProps) {
	const router = useRouter()
	const [exportLoading, setExportLoading] = useState<boolean>(false)
	const [orderBy, setOrderBy] = useState<OrderBy>("name")
	const [order, setOrder] = useState<Order>("asc")
	const [alertFilter, setAlertFilter] = useState<AlertFilter>("all")
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(20)

	const debouncedSearch = useDebounce(search)

	const { data, isLoading, refetch, isFetching } = useMaintenancePlans({
		page,
		order,
		orderBy,
		limit: pageSize,
		search: debouncedSearch,
		includeTasks: true,
		alertFilter,
	})

	const columns = useMemo(() => MaintenancePlanColumns({ userId }), [userId])

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

	const table = useReactTable<MaintenancePlan>({
		data: data?.maintenancePlans ?? [],
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

	const selectedSort = `${orderBy}-${order}` as `${OrderBy}-${Order}`

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
				alertFilter !== "all"
					? {
							key: "alertFilter",
							label: `Alertas: ${ALERT_FILTER_LABEL[alertFilter]}`,
							onClear: () => setAlertFilter("all"),
						}
					: null,
			].filter((value): value is DataGridActiveFilter => value !== null),
		[alertFilter, search]
	)

	const handleExportToExcel = useCallback(async () => {
		try {
			setExportLoading(true)

			const res: { maintenancePlans: (MaintenancePlan & { description?: string })[] } = await fetch(
				`/api/maintenance-plan?page=1&order=desc&orderBy=createdAt&limit=10000&includeTasks=true`
			).then((response) => response.json())

			if (!res?.maintenancePlans?.length) {
				toast.error("No hay planes de mantenimiento para exportar")
				return
			}

			const XLSX = await import("xlsx")

			const workbook = XLSX.utils.book_new()
			const mainSheet = XLSX.utils.json_to_sheet(
				res.maintenancePlans.map((plan) => ({
					"Nombre": plan.name,
					"Descripción": plan.description || "N/A",
					"Equipo": plan.equipment?.name || "N/A",
					"Ubicación del Equipo": plan.equipment?.location?.path ?? "N/A",
					"Cantidad de Tareas": plan.task?.length || 0,
					"Tareas Vencidas": plan.expiredTasksCount || 0,
					"Próximas Tareas (1 semana)": plan.nextWeekTasksCount || 0,
					"Creado por": plan.createdBy?.name || "N/A",
					"Fecha de Creación": plan.createdAt
						? format(new Date(plan.createdAt), "dd/MM/yyyy", { locale: es })
						: "N/A",
				}))
			)

			XLSX.utils.book_append_sheet(workbook, mainSheet, "Planes de Mantenimiento")

			const allTasks = res.maintenancePlans.flatMap((plan) =>
				(plan.task || []).map((task) => {
					const equipments = task.equipments.length > 0 ? task.equipments : [task.equipment]

					return {
						"Plan de Mantenimiento": plan.name,
						"Equipo del Plan": plan.equipment?.name || "N/A",
						"Ubicación del Equipo": plan.equipment?.location?.path ?? "N/A",
						"Nombre de la Tarea": task.name,
						"Equipos de la Tarea":
							equipments.map((equipment) => equipment.name).join(", ") || "N/A",
						"Próxima Fecha Programada": task.nextDate
							? format(new Date(task.nextDate), "dd/MM/yyyy", { locale: es })
							: "N/A",
						"Creado por": plan.createdBy?.name || "N/A",
						"Fecha de Creación del Plan": plan.createdAt
							? format(new Date(plan.createdAt), "dd/MM/yyyy", { locale: es })
							: "N/A",
					}
				})
			)

			if (allTasks.length > 0) {
				const tasksSheet = XLSX.utils.json_to_sheet(allTasks)
				XLSX.utils.book_append_sheet(workbook, tasksSheet, "Tareas Detalladas")
			}

			XLSX.writeFile(workbook, "planes-de-mantenimiento.xlsx")
			toast.success("Planes de mantenimiento exportados exitosamente")
		} catch (error) {
			console.error("[EXPORT_EXCEL]", error)
			toast.error("Error al exportar planes de mantenimiento")
		} finally {
			setExportLoading(false)
		}
	}, [])

	const resetFilters = () => {
		setSearch("")
		setAlertFilter("all")
		setOrder("asc")
		setOrderBy("name")
		setPage(1)
	}

	return (
		<div id={id} className="space-y-3">
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
								<DropdownMenuSubTrigger>Alertas</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-64">
									<DropdownMenuRadioGroup
										value={alertFilter}
										onValueChange={(value) => {
											setAlertFilter(value as AlertFilter)
											setPage(1)
										}}
									>
										{Object.entries(ALERT_FILTER_LABEL).map(([value, label]) => (
											<DropdownMenuRadioItem key={value} value={value}>
												{label}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Orden</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-64">
									<DropdownMenuRadioGroup
										value={selectedSort}
										onValueChange={(value) => {
											const [nextOrderBy, nextOrder] = value.split("-") as [OrderBy, Order]
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
					<DataGrid<MaintenancePlan>
						table={table}
						onRowClick={(row) => {
							const equipmentId = row.equipment?.id
							if (!equipmentId) return
							router.push(
								`/admin/dashboard/planes-de-mantenimiento/${row.slug}_${equipmentId}/tareas`
							)
						}}
						recordCount={data?.total ?? 0}
						isLoading={isLoading || isFetching}
						emptyMessage="No se encontraron resultados."
						tableLayout={{
							columnsVisibility: true,
							columnsResizable: true,
							columnsPinnable: true,
							width: "fixed",
						}}
					>
						<DataGridContainer border={false} className="w-full overflow-x-auto">
							<DataGridTable<MaintenancePlan> />
						</DataGridContainer>

						<DataGridPagination
							info="{from} - {to} de {count}"
							nextPageLabel="Pagina siguiente"
							rowsPerPageLabel="Filas por pagina"
							previousPageLabel="Pagina anterior"
						/>
					</DataGrid>
				</CardContent>
			</Card>
		</div>
	)
}
