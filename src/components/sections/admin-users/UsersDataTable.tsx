"use client"

import { Sheet } from "lucide-react"
import { useState } from "react"
import {
	ColumnDef,
	flexRender,
	SortingState,
	useReactTable,
	getCoreRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
	getPaginationRowModel,
} from "@tanstack/react-table"

import { AreasLabels } from "@/lib/consts/areas"

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

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	isLoading: boolean
	data: TData[]
}

export function UsersDataTable<TData, TValue>({
	columns,
	data,
	isLoading,
}: DataTableProps<TData, TValue>) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		state: {
			sorting,
			columnFilters,
		},
	})

	return (
		<section className="flex w-full flex-col items-start gap-4">
			<h2 className="text-text text-2xl font-bold">Lista de Usuarios</h2>

			<div className="flex w-full flex-wrap items-end justify-start gap-2 md:w-full md:flex-row">
				<Input
					type="text"
					className="w-full sm:w-fit"
					placeholder="Nombre..."
					value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
					onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
				/>

				<Input
					className="w-full sm:w-fit"
					placeholder="RUT..."
					value={(table.getColumn("rut")?.getFilterValue() as string) ?? ""}
					onChange={(event) => table.getColumn("rut")?.setFilterValue(event.target.value)}
				/>

				<Input
					className="w-full sm:w-fit"
					placeholder="Email..."
					value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
					onChange={(event) => table.getColumn("email")?.setFilterValue(event.target.value)}
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

			<div className="flex w-full items-center justify-end space-x-2">
				<Button
					variant="outline"
					size="sm"
					className="bg-white"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					Anterior
				</Button>

				<Button
					variant="outline"
					size="sm"
					className="bg-white"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					Siguiente
				</Button>
			</div>
		</section>
	)
}
