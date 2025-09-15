"use client"

import { FilterXIcon } from "lucide-react"
import { useState } from "react"
import {
	flexRender,
	SortingState,
	useReactTable,
	getCoreRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
} from "@tanstack/react-table"

import { useLockoutPermitFilters } from "../../hooks/use-lockout-permit-filters"
import { getLockoutPermitColumns } from "../../columns/lockout-permit-columns"
import { useCompanies } from "@/project/company/hooks/use-companies"
import { useOperators } from "@/shared/hooks/use-operators"

import { CalendarDateRangePicker } from "@/shared/components/ui/date-range-picker"
import { TablePagination } from "@/shared/components/ui/table-pagination"
import { Card, CardContent } from "@/shared/components/ui/card"
import OrderByButton from "@/shared/components/OrderByButton"
import RefreshButton from "@/shared/components/RefreshButton"
import { Skeleton } from "@/shared/components/ui/skeleton"
import SearchInput from "@/shared/components/SearchInput"
import { Button } from "@/shared/components/ui/button"
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

interface LockoutPermitsTableProps {
	hasPermission: boolean
	userId: string
	id?: string
}

const LockoutPermitStatusOptions = [
	{ value: "REVIEW_PENDING", label: "Pendiente de Revisión" },
	{ value: "ACTIVE", label: "Activo" },
	{ value: "COMPLETED", label: "Completado" },
	{ value: "REJECTED", label: "Rechazado" },
]

const LockoutTypeOptions = [
	{ value: "ELECTRICAL", label: "Eléctrico" },
	{ value: "MECHANICAL", label: "Mecánico" },
	{ value: "HYDRAULIC", label: "Hidráulico" },
	{ value: "PNEUMATIC", label: "Neumático" },
	{ value: "CHEMICAL", label: "Químico" },
	{ value: "THERMAL", label: "Térmico" },
	{ value: "OTHER", label: "Otro" },
]

export default function LockoutPermitsTable({
	hasPermission,
	userId,
	id,
}: LockoutPermitsTableProps) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])

	const {
		filters,
		actions,
		lockoutPermits: { data, isLoading, isFetching, refetch },
	} = useLockoutPermitFilters()

	const { data: companies } = useCompanies({
		limit: 1000,
	})

	const { data: operators } = useOperators({
		limit: 100,
		page: 1,
	})

	const table = useReactTable({
		onSortingChange: setSorting,
		data: data?.lockoutPermits ?? [],
		columns: getLockoutPermitColumns(hasPermission, userId),
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
							placeholder="Buscar por equipo, OT o solicitante..."
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
									<SelectLabel>Aprobado por</SelectLabel>
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
									<SelectItem value="all">Todos los Estados</SelectItem>
									{LockoutPermitStatusOptions.map((option) => (
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
								Tipo de Bloqueo
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Tipo de Bloqueo</SelectLabel>
									<SelectSeparator />
									<SelectItem value="all">Todos los Tipos</SelectItem>
									{LockoutTypeOptions.map((type) => (
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
								onClick={actions.resetFilters}
								className="size-10 border-lime-600 text-lime-600 hover:bg-lime-600 hover:text-white"
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
									<TableCell colSpan={12}>
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
									colSpan={getLockoutPermitColumns(hasPermission, userId).length}
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
