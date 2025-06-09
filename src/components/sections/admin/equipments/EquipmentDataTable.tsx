"use client"

import { FileSpreadsheetIcon } from "lucide-react"
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

import {
	useEquipments,
	WorkEquipment,
	fetchAllEquipments,
	fetchEquipments,
} from "@/hooks/use-equipments"
import { EquipmentColumns } from "./equipment-columns"

import EditEquipmentForm from "@/components/forms/admin/equipment/EditEquipmentForm"
import { TablePagination } from "@/components/ui/table-pagination"
import RefreshButton from "@/components/shared/RefreshButton"
import { Skeleton } from "@/components/ui/skeleton"
import Spinner from "@/components/shared/Spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { queryClient } from "@/lib/queryClient"

interface EquipmentDataTableProps {
	lastPath: string
	parentId: string | null
}

export function EquipmentDataTable({ parentId, lastPath }: EquipmentDataTableProps) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [exportLoading, setExportLoading] = useState(false)
	const [sorting, setSorting] = useState<SortingState>([])
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(1)

	const router = useRouter()

	const { data, isLoading, refetch, isFetching } = useEquipments({
		page,
		search,
		limit: 15,
		parentId: parentId ?? null,
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

	const handleRowClick = (id: string) => {
		router.push(`${lastPath}/${id}`)
	}

	const prefetchMaintenancePlan = (id: string) => {
		return queryClient.prefetchQuery({
			queryKey: [
				"equipments",
				{
					page: 1,
					limit: 15,
					search: "",
					parentId: id,
				},
			],
			queryFn: (fn) =>
				fetchEquipments({
					...fn,
					queryKey: [
						"equipments",
						{
							page: 1,
							limit: 15,
							search: "",
							parentId: id,
						},
					],
				}),
			staleTime: 5 * 60 * 1000,
		})
	}

	return (
		<Card>
			<CardContent className="flex w-full flex-col items-start gap-4">
				<div className="flex w-full flex-col flex-wrap items-start gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex w-full items-center gap-4">
						<Button
							onClick={handleExportToExcel}
							disabled={isLoading || exportLoading || !data?.equipments?.length}
							className="bg-emerald-500 text-white transition-all hover:scale-105"
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
								<TableHead>Acciones</TableHead>
							</TableRow>
						))}
					</TableHeader>

					<TableBody>
						{isLoading || isFetching
							? Array.from({ length: 15 }).map((_, index) => (
									<TableRow key={index}>
										<TableCell colSpan={10}>
											<Skeleton className="h-6.5 min-w-full" />
										</TableCell>
									</TableRow>
								))
							: table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
										onMouseEnter={() => prefetchMaintenancePlan(row.original.id)}
									>
										{row.getVisibleCells().map((cell) => {
											if (cell.column.id === "name") {
												return (
													<TableCell
														key={cell.id}
														onClick={() => handleRowClick(row.original.id)}
														className="font-semibold text-emerald-500 hover:cursor-pointer hover:underline"
													>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</TableCell>
												)
											}

											return (
												<TableCell key={cell.id}>
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</TableCell>
											)
										})}
										<TableCell>
											<div className="flex items-center justify-center space-x-2">
												<EditEquipmentForm
													id={row.original.id}
													equipments={data?.equipments ?? []}
												/>
											</div>
										</TableCell>
									</TableRow>
								))}

						{data?.equipments?.length === 0 && (
							<TableRow>
								<TableCell colSpan={10} className="py-8 text-center text-gray-500">
									No hay equipos
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>

				<TablePagination
					table={table}
					onPageChange={setPage}
					pageCount={data?.pages ?? 0}
					isLoading={isLoading}
				/>
			</CardContent>
		</Card>
	)
}
