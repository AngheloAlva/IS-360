"use client"

import { ArrowLeft, FileSpreadsheetIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import {
	flexRender,
	SortingState,
	useReactTable,
	getCoreRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
	getPaginationRowModel,
} from "@tanstack/react-table"

import { useEquipments, WorkEquipment, fetchAllEquipments } from "@/hooks/use-equipments"
import { EquipmentColumns } from "./equipment-columns"

import { TablePagination } from "@/components/ui/table-pagination"
import RefreshButton from "@/components/shared/RefreshButton"
import { Skeleton } from "@/components/ui/skeleton"
import Spinner from "@/components/shared/Spinner"
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

export function EquipmentDataTable() {
	const searchParams = useSearchParams()
	const parentId = searchParams.get("parentId")

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [exportLoading, setExportLoading] = useState(false)
	const [sorting, setSorting] = useState<SortingState>([])
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(1)

	const { data, isLoading, refetch, isFetching } = useEquipments({
		page,
		search,
		parentId,
		limit: 15,
	})

	const handleExportToExcel = async () => {
		try {
			setExportLoading(true)
			const equipments = await fetchAllEquipments(parentId)
			if (!equipments?.length) {
				toast.error("No hay equipos para exportar")
				return
			}

			const XLSX = await import("xlsx")

			const workbook = XLSX.utils.book_new()
			const worksheet = XLSX.utils.json_to_sheet(
				equipments.map((equipment: WorkEquipment) => ({
					"TAG": equipment.tag,
					"Nombre": equipment.name,
					"Ubicación": equipment.location,
					"Descripción": equipment.description,
					"Estado": equipment.isOperational ? "Operativo" : "No Operativo",
					"Tipo": equipment.type || "N/A",
					"Órdenes de Trabajo": equipment._count.workOrders,
					"Equipos Hijos": equipment._count.children,
					"Fecha de Creación": new Date(equipment.createdAt).toLocaleDateString(),
					"Última Actualización": new Date(equipment.updatedAt).toLocaleDateString(),
				}))
			)

			XLSX.utils.book_append_sheet(workbook, worksheet, "Equipos")
			XLSX.writeFile(workbook, "equipos.xlsx")
			toast.success("Equipos exportados exitosamente")
		} catch (error) {
			console.error("[EXPORT_EXCEL]", error)
			toast.error("Error al exportar equipos")
		} finally {
			setExportLoading(false)
		}
	}

	const table = useReactTable<WorkEquipment>({
		data: data?.equipments ?? [],
		columns: EquipmentColumns,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
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
			<div className="flex w-full flex-col flex-wrap items-start gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex w-full items-center gap-4">
					{parentId && (
						<Button
							variant="ghost"
							onClick={() => {
								window.location.href = "/admin/dashboard/equipos"
							}}
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Volver a Equipos Principales
						</Button>
					)}
					<Button
						className="border border-green-500 bg-green-500/10 text-green-500 hover:bg-green-500/20"
						onClick={handleExportToExcel}
						disabled={isLoading || exportLoading || !data?.equipments.length}
					>
						{exportLoading ? <Spinner /> : <FileSpreadsheetIcon className="mr-2 h-4 w-4" />}
						Exportar a Excel
					</Button>

					<div className="ml-auto flex items-center gap-2">
						<Input
							type="text"
							value={search}
							onChange={(e) => {
								setSearch(e.target.value)
								setPage(1)
							}}
							className="bg-background w-full sm:w-72"
							placeholder="Buscar por nombre, TAG o ubicación..."
						/>

						<RefreshButton refetch={refetch} isFetching={isFetching} />
					</div>
				</div>
			</div>

			<Card className="w-full rounded-md border p-1.5">
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
										<TableCell colSpan={9}>
											<Skeleton className="h-6.5 min-w-full" />
										</TableCell>
									</TableRow>
								))
							: table.getRowModel().rows.map((row) => (
									<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
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
