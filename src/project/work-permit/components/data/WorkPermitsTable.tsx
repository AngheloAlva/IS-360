"use client"

import { useState, useCallback } from "react"
import {
	flexRender,
	SortingState,
	useReactTable,
	getCoreRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { useWorkPermitFilters } from "../../hooks/use-work-permit-filters"
import { WorkPermitStatusOptions } from "@/lib/consts/work-permit-status"
import { getWorkPermitColumns } from "../../columns/work-permit-columns"
import { useCompanies } from "@/project/company/hooks/use-companies"
import { useOperators } from "@/shared/hooks/use-operators"
import type { WorkPermit } from "../../hooks/use-work-permit"

import { TablePagination } from "@/shared/components/ui/table-pagination"
import { CalendarDateRangePicker } from "@/shared/components/ui/date-range-picker"
import { WorkWillBeOptions } from "@/lib/consts/work-permit-options"
import { Card, CardContent } from "@/shared/components/ui/card"
import OrderByButton from "@/shared/components/OrderByButton"
import RefreshButton from "@/shared/components/RefreshButton"
import { Skeleton } from "@/shared/components/ui/skeleton"
import SearchInput from "@/shared/components/SearchInput"
import Spinner from "@/shared/components/Spinner"
import {
	Table,
	TableRow,
	TableCell,
	TableBody,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"
import {
	Select,
	SelectItem,
	SelectGroup,
	SelectLabel,
	SelectContent,
	SelectTrigger,
	SelectSeparator,
} from "@/shared/components/ui/select"
import { Button } from "@/shared/components/ui/button"
import { FilterXIcon, FileSpreadsheetIcon } from "lucide-react"

interface WorkPermitsTableProps {
	hasPermission: boolean
	userId: string
	id?: string
}

export default function WorkPermitsTable({ hasPermission, userId, id }: WorkPermitsTableProps) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])
	const [exportLoading, setExportLoading] = useState<boolean>(false)

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

	const handleExportToExcel = useCallback(async () => {
		try {
			setExportLoading(true)

			const res: { workPermits: WorkPermit[] } = await fetch(
				`/api/work-permit?page=1&order=desc&orderBy=createdAt&limit=10000`
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
	}, [])

	const table = useReactTable({
		onSortingChange: setSorting,
		data: data?.workPermits ?? [],
		columns: getWorkPermitColumns(hasPermission, userId),
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),

		state: {
			sorting,
			columnFilters,
			pagination: {
				pageIndex: filters.page - 1,
				pageSize: 10,
			},
		},
		manualPagination: true,
		pageCount: data?.pages ?? 0,
	})

	return (
		<Card id={id}>
			<CardContent className="flex w-full flex-col items-start gap-4">
				<div className="flex w-full flex-col flex-wrap items-start gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex w-full flex-col items-end gap-2 lg:flex-row">
						<SearchInput
							value={filters.search}
							setPage={actions.setPage}
							onChange={actions.setSearch}
							placeholder="Buscar por OT o trabajo solicitado..."
							className="w-full lg:w-[290px]"
						/>

						<Select
							onValueChange={(value) => {
								if (value === "all") {
									actions.setCompanyId(null)
								} else {
									actions.setCompanyId(value)
								}
							}}
							value={filters.companyId ?? "all"}
						>
							<SelectTrigger className="border-input bg-background hover:bg-input w-full border transition-colors sm:w-fit">
								Empresa
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Empresa</SelectLabel>
									<SelectSeparator />
									<SelectItem value="all">Todas las empresas</SelectItem>
									{companies?.companies?.map((company) => (
										<SelectItem key={company.id} value={company.id}>
											{company.name}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>

						<Select
							onValueChange={(value) => {
								if (value === "all") {
									actions.setApprovedBy(null)
								} else {
									actions.setApprovedBy(value)
								}
							}}
							value={filters.approvedBy ?? "all"}
						>
							<SelectTrigger className="border-input bg-background hover:bg-input w-full border transition-colors sm:w-fit">
								Aprobado por
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Aprovado por</SelectLabel>
									<SelectSeparator />
									<SelectItem value="all">Todos los Operadores</SelectItem>
									{operators?.operators?.map((operator) => (
										<SelectItem key={operator.id} value={operator.id}>
											{operator.name}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>

						<Select
							onValueChange={(value) => {
								if (value === "all") {
									actions.setStatusFilter(null)
								} else {
									actions.setStatusFilter(value)
								}
							}}
							value={filters.statusFilter ?? "all"}
						>
							<SelectTrigger className="border-input bg-background hover:bg-input w-full border transition-colors sm:w-fit">
								Estado
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Estado</SelectLabel>
									<SelectSeparator />
									<SelectItem value="all">Todos los Permisos</SelectItem>
									{WorkPermitStatusOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>

						<CalendarDateRangePicker value={filters.dateRange} onChange={actions.setDateRange} />

						<Select
							onValueChange={(value) => {
								if (value === "all") {
									actions.setTypeFilter(null)
								} else {
									actions.setTypeFilter(value)
								}
							}}
							value={filters.typeFilter ?? "all"}
						>
							<SelectTrigger className="border-input bg-background hover:bg-input w-full border transition-colors sm:w-fit">
								Tipo de Trabajo
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Tipo de Trabajo</SelectLabel>
									<SelectSeparator />
									<SelectItem value="all">Todos los Tipos</SelectItem>
									{WorkWillBeOptions.map((type) => (
										<SelectItem key={type.value} value={type.value}>
											{type.label}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>

						<div className="ml-auto flex items-center justify-end gap-2">
							<OrderByButton
								onChange={(orderBy, order) => {
									actions.setOrderBy(orderBy)
									actions.setOrder(order)
								}}
							/>

							<RefreshButton refetch={refetch} isFetching={isFetching} />

							<Button
								size={"icon"}
								variant="outline"
								onClick={handleExportToExcel}
								className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
							>
								{exportLoading ? <Spinner /> : <FileSpreadsheetIcon />}
							</Button>

							<Button
								size={"icon"}
								variant="outline"
								onClick={actions.resetFilters}
								className="border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white"
							>
								<FilterXIcon />
							</Button>
						</div>
					</div>
				</div>

				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{isLoading || isFetching ? (
							Array.from({ length: 15 }).map((_, index) => (
								<TableRow key={index}>
									<TableCell colSpan={11}>
										<Skeleton className="h-6.5 min-w-full" />
									</TableCell>
								</TableRow>
							))
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className="cursor-pointer"
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={getWorkPermitColumns(hasPermission, userId).length}
									className="h-24 text-center"
								>
									No se encontraron resultados.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>

				<TablePagination
					table={table}
					isLoading={isLoading}
					total={data?.total ?? 0}
					pageCount={data?.pages ?? 0}
					onPageChange={actions.setPage}
					className="border-rose-600 text-rose-600 hover:bg-rose-600"
				/>
			</CardContent>
		</Card>
	)
}
