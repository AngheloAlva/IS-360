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

import { EquipmentColumns } from "../../columns/equipment-columns"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { queryClient } from "@/lib/queryClient"
import { useRouter } from "next/navigation"
import {
	useEquipments,
	WorkEquipment,
	fetchAllEquipments,
	fetchEquipments,
} from "@/project/equipment/hooks/use-equipments"

import EditEquipmentForm from "@/project/equipment/components/forms/EditEquipmentForm"
import { TablePagination } from "@/shared/components/ui/table-pagination"
import { Card, CardContent } from "@/shared/components/ui/card"
import RefreshButton from "@/shared/components/RefreshButton"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import Spinner from "@/shared/components/Spinner"
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
	SelectGroup,
	SelectValue,
	SelectContent,
	SelectTrigger,
} from "@/shared/components/ui/select"

interface EquipmentTableProps {
	parentId: string | null
	lastPath: string
	id?: string
}

export function EquipmentTable({ parentId, lastPath, id }: EquipmentTableProps) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [showAll, setShowAll] = useState<boolean>(parentId ? false : true)
	const [exportLoading, setExportLoading] = useState<boolean>(false)
	const [sorting, setSorting] = useState<SortingState>([])
	const [search, setSearch] = useState<string>("")
	const [page, setPage] = useState<number>(1)

	const searchInput = useDebounce(search)

	const router = useRouter()

	const { data, isLoading, refetch, isFetching } = useEquipments({
		page,
		showAll,
		limit: 15,
		search: searchInput,
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
							showAll: false,
						},
					],
				}),
			staleTime: 5 * 60 * 1000,
		})
	}

	return (
		<Card id={id}>
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

							<Select
								onValueChange={(value) => {
									if (value === "true") {
										setShowAll(true)
									} else {
										setShowAll(false)
									}
								}}
								value={showAll ? "true" : "false"}
							>
								<SelectTrigger className="border-input bg-background w-full border md:w-fit">
									<SelectValue placeholder="Mostrar todos los equipos" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value="true">Todos los equipos</SelectItem>
										<SelectItem value="false">Equipos padres</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>

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
										<TableCell colSpan={11}>
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
								<TableCell colSpan={11} className="py-8 text-center text-gray-500">
									No hay equipos
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>

				<TablePagination
					table={table}
					isLoading={isLoading}
					onPageChange={setPage}
					total={data?.total ?? 0}
					pageCount={data?.pages ?? 0}
					className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white"
				/>
			</CardContent>
		</Card>
	)
}
