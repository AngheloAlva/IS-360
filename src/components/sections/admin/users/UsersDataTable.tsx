"use client"

import { Sheet } from "lucide-react"
import { useState } from "react"
import {
	flexRender,
	SortingState,
	useReactTable,
	getCoreRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
} from "@tanstack/react-table"

import { AreasLabels } from "@/lib/consts/areas"
import { useUsers } from "@/hooks/use-users"
import { UserColumns } from "./user-columns"

import { TablePagination } from "@/components/ui/table-pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
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

export function UsersDataTable() {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])

	const { data, isLoading } = useUsers({
		page,
		search,
		limit: 10,
	})
	console.log(data)

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
		<section className="flex w-full flex-col items-start gap-4">
			<h2 className="text-text text-2xl font-bold">Lista de Usuarios</h2>

			<div className="flex w-full flex-wrap items-end justify-start gap-2 md:w-full md:flex-row">
				<Input
					type="text"
					className="w-full sm:w-64"
					placeholder="Buscar por nombre, email o RUT..."
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
					<SelectTrigger className="border-input w-full border bg-white sm:w-fit">
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

				<Button
					size={"lg"}
					className="border-input text-primary ml-auto border bg-white hover:text-white"
				>
					<Sheet />
					Exportar
				</Button>
			</div>

			<Card className="w-full max-w-full overflow-x-scroll rounded-md border-none bg-white p-1.5">
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
						{isLoading
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
