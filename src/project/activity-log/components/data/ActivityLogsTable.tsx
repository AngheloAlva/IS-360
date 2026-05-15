"use client"

import { Columns3Icon, FilterIcon, FilterXIcon } from "lucide-react"
import { useMemo, useCallback } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
	type OnChangeFn,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table"

import { getActivityLogColumns } from "@/project/activity-log/columns/activity-log-columns"
import { useActivityLogFilters } from "@/project/activity-log/hooks/use-activity-log-filters"
import { ActivityTypeOptions } from "@/lib/consts/activity-types"
import { ModuleOptions } from "@/lib/consts/modules"
import { useOperators } from "@/shared/hooks/use-operators"

import { CalendarDateRangePicker } from "@/shared/components/ui/date-range-picker"
import { DataGridColumnVisibility } from "@/shared/components/data-grid/data-grid-column-visibility"
import { DataGridPagination } from "@/shared/components/data-grid/data-grid-pagination"
import { DataGrid, DataGridContainer } from "@/shared/components/data-grid/data-grid"
import { DataGridTable } from "@/shared/components/data-grid/data-grid-table"
import {
	DataGridToolbar,
	DataGridActiveFilters,
	type DataGridActiveFilter,
} from "@/shared/components/data-grid/data-grid-toolbar"
import { Card, CardContent } from "@/shared/components/ui/card"
import RefreshButton from "@/shared/components/RefreshButton"
import SearchInput from "@/shared/components/SearchInput"
import { Button } from "@/shared/components/ui/button"
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

import type { ApiActivityLog } from "@/project/activity-log/types/api-activity-log"
import type { OrderBy } from "@/shared/components/OrderByButton"

const actorTypeOptions = [
	{ value: "USER", label: "Usuario" },
	{ value: "EXTERNAL_VISITOR", label: "Visitante externo" },
	{ value: "SYSTEM", label: "Sistema" },
] as const

const severityOptions = [
	{ value: "LOW", label: "Baja" },
	{ value: "MEDIUM", label: "Media" },
	{ value: "HIGH", label: "Alta" },
	{ value: "CRITICAL", label: "Crítica" },
] as const

export function ActivityLogsTable() {
	const {
		filters,
		actions,
		logs: { data, isLoading, refetch, isFetching },
	} = useActivityLogFilters()

	const { data: operatorsData } = useOperators({ page: 1, limit: 100 })

	const columns = useMemo(() => getActivityLogColumns(), [])

	const sortingState: SortingState = filters.orderBy
		? [{ id: filters.orderBy, desc: filters.order === "desc" }]
		: []

	const handleSortingChange: OnChangeFn<SortingState> = useCallback(
		(updater) => {
			const nextSorting = typeof updater === "function" ? updater(sortingState) : updater
			const firstSort = nextSorting[0]

			if (!firstSort) {
				actions.setOrderBy("createdAt")
				actions.setOrder("desc")
				return
			}

			actions.setOrderBy(firstSort.id as OrderBy)
			actions.setOrder(firstSort.desc ? "desc" : "asc")
		},
		[actions, sortingState]
	)

	const handlePaginationChange: OnChangeFn<PaginationState> = useCallback(
		(updater) => {
			const currentPagination = {
				pageIndex: filters.page - 1,
				pageSize: filters.pageSize,
			}

			const nextPagination = typeof updater === "function" ? updater(currentPagination) : updater

			if (nextPagination.pageSize !== currentPagination.pageSize) {
				actions.setPageSize(nextPagination.pageSize)
			}

			if (nextPagination.pageIndex !== currentPagination.pageIndex) {
				actions.setPage(nextPagination.pageIndex + 1)
			}
		},
		[actions, filters.page, filters.pageSize]
	)

	const table = useReactTable<ApiActivityLog>({
		data: data?.logs ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		state: {
			sorting: sortingState,
			pagination: {
				pageIndex: filters.page - 1,
				pageSize: filters.pageSize,
			},
		},
		onSortingChange: handleSortingChange,
		onPaginationChange: handlePaginationChange,
		manualSorting: true,
		enableMultiSort: false,
		manualPagination: true,
		enableColumnPinning: true,
		columnResizeMode: "onChange",
		pageCount: data?.pages ?? 0,
	})

	const selectedOperatorName = useMemo(() => {
		if (filters.userId === "all") return null
		return operatorsData?.operators?.find((op) => op.id === filters.userId)?.name ?? filters.userId
	}, [filters.userId, operatorsData])

	const activeFilters = useMemo<DataGridActiveFilter[]>(
		() =>
			[
				filters.search
					? {
							key: "search",
							label: `Búsqueda: ${filters.search}`,
							onClear: () => actions.setSearch(""),
						}
					: null,
				filters.module !== "all"
					? {
							key: "module",
							label: `Módulo: ${ModuleOptions.find((m) => m.value === filters.module)?.label ?? filters.module}`,
							onClear: () => actions.setModule("all"),
						}
					: null,
				filters.action !== "all"
					? {
							key: "action",
							label: `Acción: ${ActivityTypeOptions.find((a) => a.value === filters.action)?.label ?? filters.action}`,
							onClear: () => actions.setAction("all"),
						}
					: null,
				filters.userId !== "all"
					? {
							key: "userId",
							label: `Usuario: ${selectedOperatorName}`,
							onClear: () => actions.setUserId("all"),
						}
					: null,
				filters.actorType !== "all"
					? {
							key: "actorType",
							label: `Tipo actor: ${actorTypeOptions.find((a) => a.value === filters.actorType)?.label ?? filters.actorType}`,
							onClear: () => actions.setActorType("all"),
						}
					: null,
				filters.severity !== "all"
					? {
							key: "severity",
							label: `Severidad: ${severityOptions.find((s) => s.value === filters.severity)?.label ?? filters.severity}`,
							onClear: () => actions.setSeverity("all"),
						}
					: null,
				filters.dateRange?.from
					? {
							key: "dateRange",
							label: `Fecha: ${format(filters.dateRange.from, "dd/MM/yyyy", { locale: es })}${filters.dateRange.to ? ` - ${format(filters.dateRange.to, "dd/MM/yyyy", { locale: es })}` : ""}`,
							onClear: () => actions.setDateRange(null),
						}
					: null,
			].filter((value): value is DataGridActiveFilter => value !== null),
		[
			actions,
			filters.module,
			filters.action,
			filters.search,
			filters.userId,
			filters.actorType,
			filters.severity,
			filters.dateRange,
			selectedOperatorName,
		]
	)

	return (
		<div className="space-y-3">
			<DataGridToolbar>
				<div className="flex w-full flex-col items-end gap-2 sm:flex-row sm:flex-wrap">
					<SearchInput
						value={filters.search}
						setPage={actions.setPage}
						onChange={actions.setSearch}
						className="w-full lg:w-80"
						inputClassName="h-9 bg-background"
						iconClassName="top-4.5"
						placeholder="Buscar por usuario, email o entidad..."
					/>

					<CalendarDateRangePicker value={filters.dateRange} onChange={actions.setDateRange} />

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
								<DropdownMenuSubTrigger>Módulo</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="max-h-64 w-56 overflow-y-auto">
									<DropdownMenuRadioGroup
										value={filters.module}
										onValueChange={(value) => actions.setModule(value)}
									>
										<DropdownMenuRadioItem value="all">Todos los módulos</DropdownMenuRadioItem>
										{ModuleOptions.map((mod) => (
											<DropdownMenuRadioItem key={mod.value} value={mod.value}>
												{mod.label}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Acción</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="max-h-64 w-56 overflow-y-auto">
									<DropdownMenuRadioGroup
										value={filters.action}
										onValueChange={(value) => actions.setAction(value)}
									>
										<DropdownMenuRadioItem value="all">Todas las acciones</DropdownMenuRadioItem>
										{ActivityTypeOptions.map((act) => (
											<DropdownMenuRadioItem key={act.value} value={act.value}>
												{act.label}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Usuario</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="max-h-72 w-64 overflow-y-auto">
									<DropdownMenuRadioGroup
										value={filters.userId}
										onValueChange={(value) => actions.setUserId(value)}
									>
										<DropdownMenuRadioItem value="all">Todos los usuarios</DropdownMenuRadioItem>
										{operatorsData?.operators?.map((operator) => (
											<DropdownMenuRadioItem key={operator.id} value={operator.id}>
												{operator.name}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Tipo de actor</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-56">
									<DropdownMenuRadioGroup
										value={filters.actorType}
										onValueChange={(value) => actions.setActorType(value)}
									>
										<DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
										{actorTypeOptions.map((opt) => (
											<DropdownMenuRadioItem key={opt.value} value={opt.value}>
												{opt.label}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Severidad</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-56">
									<DropdownMenuRadioGroup
										value={filters.severity}
										onValueChange={(value) => actions.setSeverity(value)}
									>
										<DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
										{severityOptions.map((opt) => (
											<DropdownMenuRadioItem key={opt.value} value={opt.value}>
												{opt.label}
											</DropdownMenuRadioItem>
										))}
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
							onClick={actions.resetFilters}
							className="size-9 text-indigo-600 hover:bg-indigo-600 hover:text-white"
						>
							<FilterXIcon className="size-4" />
						</Button>
					</div>
				</div>

				<DataGridActiveFilters filters={activeFilters} />
			</DataGridToolbar>

			<Card>
				<CardContent className="flex w-full flex-col items-start gap-4">
					<DataGrid<ApiActivityLog>
						table={table}
						recordCount={data?.total ?? 0}
						isLoading={isLoading || isFetching}
						emptyMessage="No hay registros de actividad"
						tableLayout={{
							columnsVisibility: true,
							columnsResizable: true,
							columnsPinnable: true,
							width: "fixed",
						}}
					>
						<DataGridContainer border={false} className="w-full overflow-x-auto">
							<DataGridTable<ApiActivityLog> />
						</DataGridContainer>
						<DataGridPagination
							sizes={[10, 25, 50, 100]}
							rowsPerPageLabel="Filas por página"
							previousPageLabel="Página anterior"
							nextPageLabel="Página siguiente"
							info="{from} - {to} de {count}"
						/>
					</DataGrid>
				</CardContent>
			</Card>
		</div>
	)
}
