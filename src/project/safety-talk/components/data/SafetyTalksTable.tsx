"use client"

import {
	ColumnFiltersState,
	SortingState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table"
import { Card, CardContent, CardDescription } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"

import { Skeleton } from "@/shared/components/ui/skeleton"
import { useSafetyTalksTable } from "../../hooks/use-safety-talks-table"
import { adminSafetyTalkColumns } from "../../columns/admin-safety-talk-columns"
import RefreshButton from "@/shared/components/RefreshButton"
import { TablePagination } from "@/shared/components/ui/table-pagination"
import { ApiSafetyTalk } from "../../types/api-safety-talk"

export function SafetyTalksTable() {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(1)

	const { data, isLoading, isFetching, refetch } = useSafetyTalksTable({
		page,
		search,
		limit: 15,
	})

	const table = useReactTable<ApiSafetyTalk>({
		data: data?.data ?? [],
		columns: adminSafetyTalkColumns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			sorting,
			columnFilters,
			pagination: {
				pageIndex: page - 1,
				pageSize: 15,
			},
		},
		manualPagination: true,
		pageCount: data?.pages ?? 0,
	})

	return (
		<Card>
			<CardContent className="mt-4 flex w-full flex-col items-start gap-4">
				<div className="flex w-full flex-col items-start justify-between lg:flex-row">
					<div>
						<h2 className="text-text text-2xl font-bold">Charlas de Seguridad</h2>
						<CardDescription>Lista de todas las charlas de seguridad realizadas</CardDescription>
					</div>

					<div className="my-4 flex w-full flex-col flex-wrap gap-2 md:w-fit md:flex-row lg:my-0">
						<Input
							type="text"
							value={search}
							placeholder="Buscar por Nombre..."
							className="bg-background w-full md:w-80"
							onChange={(e) => setSearch(e.target.value)}
						/>

						<RefreshButton refetch={refetch} isFetching={isFetching} />
					</div>
				</div>

				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>

					<TableBody>
						{isLoading || isFetching
							? Array.from({ length: 15 }).map((_, index) => (
									<TableRow key={index}>
										<TableCell className="" colSpan={11}>
											<Skeleton className="h-10 min-w-full" />
										</TableCell>
									</TableRow>
								))
							: table.getRowModel().rows.map((row) => (
									<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id} className="font-medium">
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										))}
									</TableRow>
								))}
					</TableBody>
				</Table>

				<TablePagination
					table={table}
					isLoading={isLoading}
					onPageChange={setPage}
					pageCount={data?.pages ?? 0}
				/>
			</CardContent>
		</Card>
	)
}
