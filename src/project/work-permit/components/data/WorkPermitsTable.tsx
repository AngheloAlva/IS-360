"use client"

import { useState } from "react"
import {
	flexRender,
	SortingState,
	useReactTable,
	getCoreRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
} from "@tanstack/react-table"

import { useWorkPermitFilters } from "../../hooks/use-work-permit-filters"
import { getWorkPermitColumns } from "../../columns/work-permit-columns"
import { useOperators } from "@/shared/hooks/use-operators"

import { TablePagination } from "@/shared/components/ui/table-pagination"
import { Card, CardContent } from "@/shared/components/ui/card"
import OrderByButton from "@/shared/components/OrderByButton"
import RefreshButton from "@/shared/components/RefreshButton"
import { Skeleton } from "@/shared/components/ui/skeleton"
import SearchInput from "@/shared/components/SearchInput"
import {
	Table,
	TableRow,
	TableCell,
	TableBody,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"
import { useCompanies } from "@/project/company/hooks/use-companies"
import {
	Select,
	SelectItem,
	SelectValue,
	SelectGroup,
	SelectLabel,
	SelectContent,
	SelectTrigger,
	SelectSeparator,
} from "@/shared/components/ui/select"

interface WorkPermitsTableProps {
	hasPermission: boolean
	userId: string
	id?: string
}

export default function WorkPermitsTable({ hasPermission, userId, id }: WorkPermitsTableProps) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])

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
					<div className="flex w-full flex-col items-end gap-4 lg:flex-row">
						<SearchInput
							value={filters.search}
							setPage={actions.setPage}
							onChange={actions.setSearch}
							placeholder="Buscar permisos por OT o trabajo solicitado..."
							className="w-full lg:w-[350px]"
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
								<SelectValue placeholder="Empresa" />
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
								<SelectValue placeholder="Seleccione operador" />
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

						<div className="ml-auto flex items-center justify-end gap-2">
							<OrderByButton
								onChange={(orderBy, order) => {
									actions.setOrderBy(orderBy)
									actions.setOrder(order)
								}}
							/>

							<RefreshButton refetch={refetch} isFetching={isFetching} />
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
									<TableCell colSpan={10}>
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
