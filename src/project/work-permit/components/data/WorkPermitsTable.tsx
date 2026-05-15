"use client"

import { Columns3Icon, FileSpreadsheetIcon, FilterIcon, FilterXIcon } from "lucide-react"
import { useState, useCallback, useMemo } from "react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { toast } from "sonner"
import {
	useReactTable,
	getCoreRowModel,
	type OnChangeFn,
	type SortingState,
	type PaginationState,
} from "@tanstack/react-table"

import { useWorkPermitFilters } from "../../hooks/use-work-permit-filters"
import { WorkPermitStatusOptions } from "@/lib/consts/work-permit-status"
import { getWorkPermitColumns } from "../../columns/work-permit-columns"
import WorkPermitDetailsDialog from "../dialogs/WorkPermitDetailsDialog"
import { useCompanies } from "@/project/company/hooks/use-companies"
import { useOperators } from "@/shared/hooks/use-operators"
import {
	WORK_PERMIT_SORT_BY,
	type WorkPermit,
	type WorkPermitSortBy,
} from "../../hooks/use-work-permit"

import { DataGridColumnVisibility } from "@/shared/components/data-grid/data-grid-column-visibility"
import { DataGridPagination } from "@/shared/components/data-grid/data-grid-pagination"
import { DataGrid, DataGridContainer } from "@/shared/components/data-grid/data-grid"
import {
	DataGridActiveFilters,
	DataGridToolbar,
	type DataGridActiveFilter,
} from "@/shared/components/data-grid/data-grid-toolbar"
import { CalendarDateRangePicker } from "@/shared/components/ui/date-range-picker"
import { DataGridTable } from "@/shared/components/data-grid/data-grid-table"
import { WorkWillBeOptions } from "@/lib/consts/work-permit-options"
import { Card, CardContent } from "@/shared/components/ui/card"
import RefreshButton from "@/shared/components/RefreshButton"
import SearchInput from "@/shared/components/SearchInput"
import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"
import {
	DropdownMenu,
	DropdownMenuSub,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuRadioGroup,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
} from "@/shared/components/ui/dropdown-menu"

interface WorkPermitsTableProps {
	hasPermission: boolean
	id?: string
}

const SORTING_COLUMN_TO_API: Record<string, WorkPermitSortBy> = {
	otNumber: WORK_PERMIT_SORT_BY.OT_NUMBER,
	aplicantPt: WORK_PERMIT_SORT_BY.APPLICANT_NAME,
	executanCompany: WORK_PERMIT_SORT_BY.COMPANY_NAME,
	approvalBy: WORK_PERMIT_SORT_BY.APPROVAL_BY_NAME,
	status: WORK_PERMIT_SORT_BY.STATUS,
	exactPlace: WORK_PERMIT_SORT_BY.EXACT_PLACE,
	startDate: WORK_PERMIT_SORT_BY.START_DATE,
	endDate: WORK_PERMIT_SORT_BY.END_DATE,
}

const API_SORT_TO_COLUMN: Partial<Record<WorkPermitSortBy, string>> = {
	[WORK_PERMIT_SORT_BY.OT_NUMBER]: "otNumber",
	[WORK_PERMIT_SORT_BY.APPLICANT_NAME]: "aplicantPt",
	[WORK_PERMIT_SORT_BY.COMPANY_NAME]: "executanCompany",
	[WORK_PERMIT_SORT_BY.APPROVAL_BY_NAME]: "approvalBy",
	[WORK_PERMIT_SORT_BY.STATUS]: "status",
	[WORK_PERMIT_SORT_BY.EXACT_PLACE]: "exactPlace",
	[WORK_PERMIT_SORT_BY.START_DATE]: "startDate",
	[WORK_PERMIT_SORT_BY.END_DATE]: "endDate",
}

export default function WorkPermitsTable({ hasPermission, id }: WorkPermitsTableProps) {
	const [exportLoading, setExportLoading] = useState<boolean>(false)
	const [selectedWorkPermit, setSelectedWorkPermit] = useState<WorkPermit | null>(null)
	const [isDetailsOpen, setIsDetailsOpen] = useState(false)

	const {
		filters,
		actions,
		workPermits: { data, isLoading, isFetching, refetch },
	} = useWorkPermitFilters()

	const { data: companies } = useCompanies({
		limit: 1000,
	})

	const { data: operators } = useOperators({
		limit: 100,
		page: 1,
	})

	const companyName = useMemo(
		() => companies?.companies?.find((company) => company.id === filters.companyId)?.name ?? null,
		[companies?.companies, filters.companyId]
	)

	const operatorName = useMemo(
		() =>
			operators?.operators?.find((operator) => operator.id === filters.approvedBy)?.name ?? null,
		[operators?.operators, filters.approvedBy]
	)

	const statusLabel = useMemo(
		() =>
			WorkPermitStatusOptions.find((status) => status.value === filters.statusFilter)?.label ??
			null,
		[filters.statusFilter]
	)

	const typeLabel = useMemo(
		() => WorkWillBeOptions.find((type) => type.value === filters.typeFilter)?.label ?? null,
		[filters.typeFilter]
	)

	const sortingState: SortingState = API_SORT_TO_COLUMN[filters.sortBy]
		? [{ id: API_SORT_TO_COLUMN[filters.sortBy]!, desc: filters.sortOrder === "desc" }]
		: []

	const columns = useMemo(() => getWorkPermitColumns(hasPermission), [hasPermission])

	const handleExportToExcel = useCallback(async () => {
		try {
			setExportLoading(true)
			const searchParams = new URLSearchParams()
			searchParams.set("page", "1")
			searchParams.set("limit", "10000")
			searchParams.set("sortBy", filters.sortBy)
			searchParams.set("sortOrder", filters.sortOrder)
			searchParams.set("include", "export")

			if (filters.search) searchParams.set("search", filters.search)
			if (filters.companyId) searchParams.set("companyId", filters.companyId)
			if (filters.approvedBy) searchParams.set("approvedBy", filters.approvedBy)
			if (filters.typeFilter) searchParams.set("typeFilter", filters.typeFilter)
			if (filters.statusFilter) searchParams.set("statusFilter", filters.statusFilter)
			if (filters.dateRange?.from) searchParams.set("dateFrom", `${filters.dateRange.from}`)
			if (filters.dateRange?.to) searchParams.set("dateTo", `${filters.dateRange.to}`)
			if (filters.hasLockoutPermit) searchParams.set("hasLockoutPermit", "true")

			const res: { workPermits: WorkPermit[] } = await fetch(
				`/api/work-permit?${searchParams.toString()}`
			).then((res) => res.json())

			if (!res?.workPermits?.length) {
				toast.error("No hay permisos de trabajo para exportar")
				return
			}

			const XLSX = await import("xlsx")

			const workbook = XLSX.utils.book_new()
			const worksheet = XLSX.utils.json_to_sheet(
				res?.workPermits.map((workPermit: WorkPermit) => ({
					"N° OT": workPermit.otNumber?.otNumber || "URGENTE",
					"Empresa": workPermit.company?.name,
					"Solicitante": workPermit.user?.name,
					"RUT Solicitante": workPermit.user?.rut,
					"Estado": workPermit.status,
					"Trabajo Requerido": workPermit.otNumber?.workRequest || "N/A",
					"Tipo de Trabajo": workPermit.workWillBe,
					"Lugar Exacto": workPermit.exactPlace,
					"Mutualidad": workPermit.mutuality,
					"Fecha de Inicio": format(new Date(workPermit.startDate), "dd/MM/yyyy", { locale: es }),
					"Fecha de Término": format(new Date(workPermit.endDate), "dd/MM/yyyy", { locale: es }),
					"Herramientas": Array.isArray(workPermit.tools)
						? workPermit.tools.join(", ")
						: workPermit.tools,
					"Genera Residuos": workPermit.generateWaste ? "Sí" : "No",
					"Tipo de Residuos": workPermit.wasteType || "N/A",
					"Participantes": workPermit._count?.participants || 0,
					"Adjuntos": workPermit._count?.attachments || 0,
					"Fecha de Aprobación": workPermit.approvalDate
						? format(new Date(workPermit.approvalDate), "dd/MM/yyyy", { locale: es })
						: "N/A",
					"Aprobado por": workPermit.approvalBy?.name || "N/A",
					"Fecha de Cierre": workPermit.closingDate
						? format(new Date(workPermit.closingDate), "dd/MM/yyyy", { locale: es })
						: "N/A",
					"Cerrado por":
						workPermit.closingBy?.name ||
						(workPermit.status === "COMPLETED" ? "Sistema (Cierre Automático)" : "N/A"),
					"Observaciones": workPermit.observations || "N/A",
				}))
			)

			XLSX.utils.book_append_sheet(workbook, worksheet, "Permisos de Trabajo")
			XLSX.writeFile(workbook, "permisos-de-trabajo.xlsx")
			toast.success("Permisos de trabajo exportados exitosamente")
		} catch (error) {
			console.error("[EXPORT_EXCEL]", error)
			toast.error("Error al exportar permisos de trabajo")
		} finally {
			setExportLoading(false)
		}
	}, [filters])

	const handleSortingChange: OnChangeFn<SortingState> = useCallback(
		(updater) => {
			const nextSorting = typeof updater === "function" ? updater(sortingState) : updater
			const firstSort = nextSorting[0]

			if (!firstSort) {
				actions.setSortBy(WORK_PERMIT_SORT_BY.CREATED_AT)
				actions.setSortOrder("desc")
				return
			}

			const sortBy = SORTING_COLUMN_TO_API[firstSort.id] ?? WORK_PERMIT_SORT_BY.CREATED_AT
			actions.setSortBy(sortBy)
			actions.setSortOrder(firstSort.desc ? "desc" : "asc")
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

	const table = useReactTable({
		data: data?.workPermits ?? [],
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
		manualPagination: true,
		enableMultiSort: false,
		enableColumnPinning: true,
		columnResizeMode: "onChange",
		pageCount: data?.pages ?? 0,
	})

	const activeFilters = useMemo<DataGridActiveFilter[]>(
		() =>
			[
				filters.search
					? {
							key: "search",
							label: `Busqueda: ${filters.search}`,
							onClear: () => actions.setSearch(""),
						}
					: null,
				companyName
					? {
							key: "company",
							label: `Empresa: ${companyName}`,
							onClear: () => actions.setCompanyId(null),
						}
					: null,
				operatorName
					? {
							key: "operator",
							label: `Aprobado por: ${operatorName}`,
							onClear: () => actions.setApprovedBy(null),
						}
					: null,
				statusLabel
					? {
							key: "status",
							label: `Estado: ${statusLabel}`,
							onClear: () => actions.setStatusFilter(null),
						}
					: null,
				typeLabel
					? {
							key: "type",
							label: `Tipo: ${typeLabel}`,
							onClear: () => actions.setTypeFilter(null),
						}
					: null,
				filters.hasLockoutPermit
					? {
							key: "lockout",
							label: "Permiso de bloqueo: Con LOTO",
							onClear: () => actions.setHasLockoutPermit(null),
						}
					: null,
				filters.dateRange?.from
					? {
							key: "dateRange",
							label: `Fecha: ${format(filters.dateRange.from, "dd/MM/yyyy")}${filters.dateRange.to ? ` - ${format(filters.dateRange.to, "dd/MM/yyyy")}` : ""}`,
							onClear: () => actions.setDateRange(null),
						}
					: null,
			].filter((value): value is DataGridActiveFilter => value !== null),
		[
			actions,
			companyName,
			filters.dateRange,
			filters.hasLockoutPermit,
			filters.search,
			operatorName,
			statusLabel,
			typeLabel,
		]
	)

	return (
		<div id={id} className="space-y-3">
			<DataGridToolbar>
				<div className="flex w-full flex-col items-end gap-2 sm:flex-row sm:flex-wrap">
					<SearchInput
						inputClassName="h-9"
						value={filters.search}
						iconClassName="top-4.5"
						setPage={actions.setPage}
						className="w-full lg:w-80"
						onChange={actions.setSearch}
						placeholder="Buscar por OT o trabajo solicitado..."
					/>

					<CalendarDateRangePicker value={filters.dateRange} onChange={actions.setDateRange} />

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="h-9">
								<FilterIcon className="size-4" />
								Filtros
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-64" align="start">
							<DropdownMenuLabel>Filtros de tabla</DropdownMenuLabel>
							<DropdownMenuSeparator />

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Empresa</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="max-h-72 w-64 overflow-y-auto">
									<DropdownMenuRadioGroup
										value={filters.companyId ?? "all"}
										onValueChange={(value) => actions.setCompanyId(value === "all" ? null : value)}
									>
										<DropdownMenuRadioItem value="all">Todas las empresas</DropdownMenuRadioItem>
										{companies?.companies?.map((company) => (
											<DropdownMenuRadioItem key={company.id} value={company.id}>
												{company.name}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Aprobado por</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="max-h-72 w-64 overflow-y-auto">
									<DropdownMenuRadioGroup
										value={filters.approvedBy ?? "all"}
										onValueChange={(value) => actions.setApprovedBy(value === "all" ? null : value)}
									>
										<DropdownMenuRadioItem value="all">Todos los operadores</DropdownMenuRadioItem>
										{operators?.operators?.map((operator) => (
											<DropdownMenuRadioItem key={operator.id} value={operator.id}>
												{operator.name}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Estado</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-56">
									<DropdownMenuRadioGroup
										value={filters.statusFilter ?? "all"}
										onValueChange={(value) =>
											actions.setStatusFilter(value === "all" ? null : value)
										}
									>
										<DropdownMenuRadioItem value="all">Todos los permisos</DropdownMenuRadioItem>
										{WorkPermitStatusOptions.map((option) => (
											<DropdownMenuRadioItem key={option.value} value={option.value}>
												{option.label}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Tipo de trabajo</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-56">
									<DropdownMenuRadioGroup
										value={filters.typeFilter ?? "all"}
										onValueChange={(value) => actions.setTypeFilter(value === "all" ? null : value)}
									>
										<DropdownMenuRadioItem value="all">Todos los tipos</DropdownMenuRadioItem>
										{WorkWillBeOptions.map((type) => (
											<DropdownMenuRadioItem key={type.value} value={type.value}>
												{type.label}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Permiso de bloqueo</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-56">
									<DropdownMenuRadioGroup
										value={filters.hasLockoutPermit ? "true" : "all"}
										onValueChange={(value) =>
											actions.setHasLockoutPermit(value === "true" ? true : null)
										}
									>
										<DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="true">
											Con permiso de bloqueo
										</DropdownMenuRadioItem>
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>
						</DropdownMenuContent>
					</DropdownMenu>

					<div className="ml-auto flex items-center justify-end gap-2">
						<RefreshButton refetch={refetch} isFetching={isFetching} />

						<Button
							size="icon"
							variant="outline"
							onClick={handleExportToExcel}
							className="size-10 text-green-600 hover:bg-green-600 hover:text-white"
						>
							{exportLoading ? <Spinner /> : <FileSpreadsheetIcon />}
						</Button>

						<DataGridColumnVisibility
							table={table}
							trigger={
								<Button size="icon" variant="outline" className="size-10">
									<Columns3Icon className="size-4" />
								</Button>
							}
						/>

						<Button
							size="icon"
							variant="outline"
							onClick={actions.resetFilters}
							className="size-10 text-pink-600 hover:bg-pink-600 hover:text-white"
						>
							<FilterXIcon className="size-4" />
						</Button>
					</div>
				</div>

				<DataGridActiveFilters filters={activeFilters} />
			</DataGridToolbar>

			<Card>
				<CardContent className="flex w-full flex-col items-start gap-4">
					<DataGrid<WorkPermit>
						table={table}
						recordCount={data?.total ?? 0}
						isLoading={isLoading || isFetching}
						emptyMessage="No se encontraron resultados."
						onRowClick={(row) => {
							setSelectedWorkPermit(row)
							setIsDetailsOpen(true)
						}}
						tableLayout={{
							columnsVisibility: true,
							columnsResizable: true,
							columnsPinnable: true,
							width: "fixed",
						}}
					>
						<DataGridContainer border={false} className="w-full overflow-x-auto">
							<DataGridTable<WorkPermit> />
						</DataGridContainer>
						<DataGridPagination
							rowsPerPageLabel="Filas por pagina"
							previousPageLabel="Pagina anterior"
							nextPageLabel="Pagina siguiente"
							info="{from} - {to} de {count}"
						/>
					</DataGrid>

					{selectedWorkPermit ? (
						<WorkPermitDetailsDialog
							workPermit={selectedWorkPermit}
							open={isDetailsOpen}
							onOpenChange={setIsDetailsOpen}
						/>
					) : null}
				</CardContent>
			</Card>
		</div>
	)
}
