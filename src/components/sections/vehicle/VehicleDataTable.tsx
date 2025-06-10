"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import {
	flexRender,
	SortingState,
	useReactTable,
	VisibilityState,
	getCoreRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
} from "@tanstack/react-table"

import { fetchVehicleById } from "@/hooks/vehicles/use-vehicle-by-id"
import { useVehicles, Vehicle } from "@/hooks/vehicles/use-vehicles"
import { VehicleTypeOptions } from "@/lib/consts/vehicle-types"
import { queryClient } from "@/lib/queryClient"

import VehicleForm from "@/components/forms/dashboard/vehicle/VehicleForm"
import { TablePagination } from "@/components/ui/table-pagination"
import RefreshButton from "@/components/shared/RefreshButton"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { vehicleColumns } from "./vehicle-columns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
	SelectSeparator,
} from "@/components/ui/select"
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

export function VehicleDataTable({ companyId }: { companyId: string }) {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [sorting, setSorting] = useState<SortingState>([])
	const [typeFilter, setTypeFilter] = useState<string | null>(null)
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [rowSelection, setRowSelection] = useState({})

	const { data, isLoading, refetch, isFetching } = useVehicles({
		page,
		search,
		limit: 10,
		typeFilter,
	})

	const table = useReactTable<Vehicle>({
		columns: vehicleColumns,
		onSortingChange: setSorting,
		data: data?.vehicles ?? [],
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,

		state: {
			sorting,
			columnFilters,
			pagination: {
				pageIndex: page - 1,
				pageSize: 10,
			},
			rowSelection,
			columnVisibility,
		},
		manualPagination: true,
		pageCount: data?.pages ?? 0,
	})

	const prefetchVehicleById = (vehicleId: string) => {
		queryClient.prefetchQuery({
			queryKey: ["vehicle", { vehicleId }],
			queryFn: () => fetchVehicleById({ vehicleId }),
			staleTime: 5 * 60 * 1000,
		})
	}

	return (
		<>
			<div className="rounded-lg bg-gradient-to-r from-teal-600 to-emerald-700 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Vehículos y Equipos</h1>
						<p className="opacity-90">
							Visualiza y gestiona todos los vehículos y equipos de tu empresa
						</p>
					</div>

					<VehicleForm companyId={companyId} />
				</div>
			</div>

			<Card>
				<CardContent className="flex w-full flex-col items-start gap-4">
					<div className="flex w-full items-center gap-2 sm:flex-row">
						<Input
							placeholder="Buscar vehículo..."
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							className="bg-background h-8 w-full sm:w-[300px]"
						/>

						<Select
							onValueChange={(value) => {
								if (value === "all") {
									setTypeFilter(null)
								} else {
									setTypeFilter(value)
								}
							}}
							value={typeFilter ?? "all"}
						>
							<SelectTrigger className="border-input bg-background ml-auto w-full border sm:w-fit">
								<SelectValue placeholder="Tipo" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Tipo de vehículo</SelectLabel>
									<SelectSeparator />
									<SelectItem value="all">Todos los tipos</SelectItem>
									{VehicleTypeOptions.map((type) => (
										<SelectItem key={type.value} value={type.value}>
											{type.label}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button className="text-text border-input hover:bg-input bg-background border">
									Columnas <ChevronDown />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{table
									.getAllColumns()
									.filter((column) => column.getCanHide())
									.map((column) => {
										return (
											<DropdownMenuCheckboxItem
												key={column.id}
												className="capitalize"
												checked={column.getIsVisible()}
												onCheckedChange={(value) => column.toggleVisibility(!!value)}
											>
												{(column.columnDef.header as string) || column.id}
											</DropdownMenuCheckboxItem>
										)
									})}
							</DropdownMenuContent>
						</DropdownMenu>

						<RefreshButton refetch={refetch} isFetching={isFetching} />
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
											<TableCell className="" colSpan={17}>
												<Skeleton className="h-10 min-w-full" />
											</TableCell>
										</TableRow>
									))
								: table.getRowModel().rows.map((row) => (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && "selected"}
											onMouseEnter={() => prefetchVehicleById(row.original.id)}
										>
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id} className="font-medium">
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</TableCell>
											))}
										</TableRow>
									))}

							{table.getRowModel().rows.length === 0 && (
								<TableRow>
									<TableCell colSpan={17} className="h-24 text-center">
										No hay vehículos
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>

					<TablePagination
						table={table}
						isLoading={isLoading}
						onPageChange={setPage}
						pageCount={data?.pages ?? 0}
						className="border-teal-600 text-teal-600"
					/>
				</CardContent>
			</Card>
		</>
	)
}
