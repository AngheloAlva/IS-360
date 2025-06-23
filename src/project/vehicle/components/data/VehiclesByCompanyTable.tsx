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

import { useVehiclesByCompany, type Vehicle } from "../../hooks/use-vehicles-by-company"
import { fetchVehicleById } from "@/project/vehicle/hooks/use-vehicle-by-id"
import { VehicleTypeOptions } from "@/lib/consts/vehicle-types"
import { vehicleColumns } from "../../columns/vehicle-columns"
import { queryClient } from "@/lib/queryClient"

import { TablePagination } from "@/shared/components/ui/table-pagination"
import { Card, CardContent } from "@/shared/components/ui/card"
import RefreshButton from "@/shared/components/RefreshButton"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"
import {
	Select,
	SelectItem,
	SelectLabel,
	SelectValue,
	SelectGroup,
	SelectTrigger,
	SelectContent,
	SelectSeparator,
} from "@/shared/components/ui/select"
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuCheckboxItem,
} from "@/shared/components/ui/dropdown-menu"

import type { VEHICLE_TYPE } from "@prisma/client"

export function VehiclesByCompanyTable({ companyId }: { companyId: string }) {
	const [typeFilter, setTypeFilter] = useState<VEHICLE_TYPE | undefined>(undefined)
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])
	const [rowSelection, setRowSelection] = useState({})
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(1)

	const { data, isLoading, refetch, isFetching } = useVehiclesByCompany({
		page,
		search,
		limit: 15,
		companyId,
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
								setTypeFilter(undefined)
							} else {
								setTypeFilter(value as VEHICLE_TYPE)
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
	)
}
