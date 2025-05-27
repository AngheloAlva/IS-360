"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
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
import { deleteVehicle } from "@/actions/vehicles/deleteVehicle"
import { VehicleTypeOptions } from "@/lib/consts/vehicle-types"
import { queryClient } from "@/lib/queryClient"

import CreateVehicleForm from "@/components/forms/dashboard/vehicle/CreateVehicleForm"
import { TablePagination } from "@/components/ui/table-pagination"
import RefreshButton from "@/components/shared/RefreshButton"
import { vehicleColumns } from "./vehicle-columns"
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
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet"

export function VehicleDataTable({ companyId }: { companyId: string }) {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [sorting, setSorting] = useState<SortingState>([])
	const [typeFilter, setTypeFilter] = useState<string | null>(null)
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [rowSelection, setRowSelection] = useState({})
	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const [editVehicleId, setEditVehicleId] = useState<string | null>(null)

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

	const handleVehicleEdit = (vehicleId: string) => {
		setEditVehicleId(vehicleId)
		setIsCreateOpen(true)
	}

	const handleVehicleDelete = async (vehicleId: string) => {
		if (
			confirm(
				"¿Estás seguro de que deseas eliminar este vehículo? Esta acción no se puede deshacer."
			)
		) {
			const result = await deleteVehicle({ vehicleId, companyId })

			if (result.ok) {
				toast.success("Vehículo eliminado", {
					description: result.message,
				})

				// Invalidar la caché para actualizar la lista
				queryClient.invalidateQueries({
					queryKey: ["vehicles"],
				})
			} else {
				toast.error("Error", {
					description: result.message,
				})
			}
		}
	}

	// Exponer funciones al objeto window para el acceso desde las columnas
	if (typeof window !== "undefined") {
		window.vehicleEdit = handleVehicleEdit
		window.vehicleDelete = handleVehicleDelete
	}

	return (
		<section className="flex w-full flex-col items-start gap-6">
			<div className="flex w-full items-center justify-between">
				<div>
					<h1 className="text-text text-2xl font-bold">Lista de Vehículos</h1>
					<p className="text-muted-foreground">
						Visualiza y gestiona todos los vehículos de tu empresa
					</p>
				</div>

				<Button
					onClick={() => {
						setEditVehicleId(null)
						setIsCreateOpen(true)
					}}
				>
					Crear Vehículo
				</Button>
			</div>

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

			<Card className="w-full max-w-full rounded-md p-1.5">
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
			</Card>

			<TablePagination
				table={table}
				isLoading={isLoading}
				onPageChange={setPage}
				pageCount={data?.pages ?? 0}
			/>

			<Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<SheetContent className="sm:max-w-lg">
					<SheetHeader>
						<SheetTitle>{editVehicleId ? "Editar Vehículo" : "Crear Vehículo"}</SheetTitle>
						<SheetDescription>
							{editVehicleId
								? "Actualiza la información del vehículo"
								: "Completa los datos para registrar un nuevo vehículo"}
						</SheetDescription>
					</SheetHeader>

					<div className="grid gap-4 px-4 py-4">
						<CreateVehicleForm
							vehicleId={editVehicleId}
							companyId={companyId}
							onSuccess={() => {
								setIsCreateOpen(false)
								queryClient.invalidateQueries({
									queryKey: ["vehicles"],
								})
								if (editVehicleId) {
									queryClient.invalidateQueries({
										queryKey: ["vehicle", { vehicleId: editVehicleId }],
									})
								}
							}}
						/>
					</div>
				</SheetContent>
			</Sheet>
		</section>
	)
}

// Agregar tipos al objeto window
declare global {
	interface Window {
		vehicleEdit: (vehicleId: string) => void
		vehicleDelete: (vehicleId: string) => void
	}
}
