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

import { useUsers } from "@/hooks/users/use-users"
import { AreasLabels } from "@/lib/consts/areas"
import { UserColumns } from "./user-columns"

import InternalUserFormSheet from "@/components/forms/admin/user/InternalUserFormSheet"
import { TablePagination } from "@/components/ui/table-pagination"
import RefreshButton from "@/components/shared/RefreshButton"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/components/ui/table"
import {
	Select,
	SelectItem,
	SelectLabel,
	SelectValue,
	SelectGroup,
	SelectTrigger,
	SelectContent,
} from "@/components/ui/select"

import type { ApiUser } from "@/types/user"

export function UsersDataTable({ hasPermission }: { hasPermission: boolean }) {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])

	const { data, isLoading, refetch, isFetching } = useUsers({
		page,
		search,
		limit: 15,
	})

	const table = useReactTable<ApiUser>({
		data: data?.users ?? [],
		columns: UserColumns,
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
		<section className="mt-4 flex w-full flex-col items-start gap-4">
			<div className="flex w-full flex-col items-start justify-between lg:flex-row">
				<h2 className="text-text text-2xl font-bold">Lista de Usuarios</h2>

				<div className="my-4 flex w-full flex-col flex-wrap gap-2 md:w-fit md:flex-row lg:my-0">
					<Input
						type="text"
						className="bg-background w-full md:w-80"
						placeholder="Buscar por Nombre, Email o RUT..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>

					<Select
						onValueChange={(value) => {
							if (value === "all") {
								table.getColumn("area")?.setFilterValue(undefined)
							} else {
								table.getColumn("area")?.setFilterValue(value)
							}
						}}
						value={(table.getColumn("area")?.getFilterValue() as string) ?? "all"}
					>
						<SelectTrigger className="border-input bg-background w-full border md:w-fit">
							<SelectValue placeholder="Área" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Áreas</SelectLabel>
								<SelectItem value="all">Todas las áreas</SelectItem>
								{Object.keys(AreasLabels).map((area) => (
									<SelectItem key={area} value={area}>
										{AreasLabels[area as keyof typeof AreasLabels]}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					<RefreshButton refetch={refetch} isFetching={isFetching} />
				</div>
			</div>

			<Card className="w-full max-w-full rounded-md border-none p-1.5">
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

								{hasPermission && <TableHead>Acciones</TableHead>}
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

										{hasPermission && (
											<TableCell>
												<InternalUserFormSheet initialData={row.original} />
											</TableCell>
										)}
									</TableRow>
								))}
					</TableBody>
				</Table>
			</Card>

			<TablePagination
				table={table}
				onPageChange={setPage}
				pageCount={data?.pages ?? 0}
				isLoading={isLoading}
			/>
		</section>
	)
}
