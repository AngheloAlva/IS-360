"use client"

import { useState } from "react"
import {
	flexRender,
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	getFilteredRowModel,
	getPaginationRowModel,
} from "@tanstack/react-table"

import { useWorkPermits } from "@/project/work-permit/hooks/use-work-permit"
import { getWorkPermitColumns } from "../../columns/work-permit-columns"
import { useDebounce } from "@/shared/hooks/useDebounce"

import OrderByButton, { type Order, type OrderBy } from "@/shared/components/OrderByButton"
import { TablePagination } from "@/shared/components/ui/table-pagination"
import { Card, CardContent } from "@/shared/components/ui/card"
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

export default function WorkPermitsTable({
	hasPermission,
	userId,
}: {
	hasPermission: boolean
	userId: string
}) {
	const [orderBy, setOrderBy] = useState<OrderBy>("createdAt")
	const [sorting, setSorting] = useState<SortingState>([])
	const [order, setOrder] = useState<Order>("desc")
	const [search, setSearch] = useState<string>("")
	const [page, setPage] = useState<number>(1)

	const debouncedSearch = useDebounce(search)

	const { data, isLoading, refetch, isFetching } = useWorkPermits({
		page,
		order,
		orderBy,
		limit: 15,
		companyId: null,
		dateRange: null,
		statusFilter: null,
		search: debouncedSearch,
	})

	const table = useReactTable({
		data: data?.workPermits ?? [],
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		columns: getWorkPermitColumns(hasPermission, userId),
		getPaginationRowModel: getPaginationRowModel(),
		state: {
			sorting,
		},
		manualPagination: true,
		pageCount: data?.pages ?? 1,
	})

	return (
		<Card>
			<CardContent className="flex w-full flex-col items-start gap-4">
				<div className="flex w-full flex-col flex-wrap items-start gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex w-full items-center justify-between gap-4">
						<SearchInput
							value={search}
							onChange={setSearch}
							placeholder="Buscar permisos..."
							className="w-[150px] lg:w-[250px]"
						/>

						<div className="flex items-center gap-2">
							<OrderByButton
								onChange={(orderBy, order) => {
									setOrderBy(orderBy)
									setOrder(order)
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

				{data && (
					<TablePagination
						table={table}
						pageCount={data.pages}
						onPageChange={setPage}
						isLoading={isLoading}
						className="border-rose-600 text-rose-600 hover:bg-rose-600"
					/>
				)}
			</CardContent>
		</Card>
	)
}
