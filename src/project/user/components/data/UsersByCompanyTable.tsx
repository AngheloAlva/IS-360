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

import { useUsersByCompany } from "@/project/user/hooks/use-users-by-company"
import { UserByCompanyColumns } from "../../columns/user-by-company-columns"

import { TablePagination } from "@/shared/components/ui/table-pagination"
import { Card, CardContent } from "@/shared/components/ui/card"
import RefreshButton from "@/shared/components/RefreshButton"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Input } from "@/shared/components/ui/input"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

import type { UsersByCompany } from "@/project/user/hooks/use-users-by-company"

export function UsersByCompanyTable({ companyId }: { companyId: string }) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(1)

	const { data, isLoading, refetch, isFetching } = useUsersByCompany({
		page,
		search,
		limit: 10,
		companyId,
	})

	const table = useReactTable<UsersByCompany>({
		data: data?.users ?? [],
		columns: UserByCompanyColumns,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			sorting,
			columnFilters,
			pagination: {
				pageIndex: page - 1,
				pageSize: 10,
			},
		},
		manualPagination: true,
		pageCount: data?.pages ?? 0,
	})

	return (
		<Card>
			<CardContent className="flex w-full flex-col items-start gap-4">
				<div className="flex w-full flex-col items-center justify-between lg:flex-row">
					<h2 className="text-text text-2xl font-bold">Lista de Usuarios</h2>

					<div className="flex flex-row items-center justify-center gap-2">
						<Input
							type="text"
							value={search}
							onChange={(e) => {
								setSearch(e.target.value)
								setPage(1)
							}}
							className="bg-background w-full sm:w-80"
							placeholder="Buscar por Nombre, Empresa, Email o RUT..."
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
							? Array.from({ length: 10 }).map((_, index) => (
									<TableRow key={index}>
										<TableCell className="" colSpan={8}>
											<Skeleton className="h-9 min-w-full" />
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
					className="border-orange-600 text-orange-600"
				/>
			</CardContent>
		</Card>
	)
}
