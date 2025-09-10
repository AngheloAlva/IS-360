"use client"

import { useState, useCallback } from "react"
import { FileSpreadsheetIcon } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
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

import { fetchMaintenancePlanTasks } from "@/project/maintenance-plan/hooks/use-maintenance-plans-tasks"
import { MaintenancePlanColumns } from "../../columns/maintenance-plan-columns"
import MaintenancePlanForm from "../forms/MaintenancePlanForm"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { queryClient } from "@/lib/queryClient"
import {
	useMaintenancePlans,
	type MaintenancePlan,
} from "@/project/maintenance-plan/hooks/use-maintenance-plans"

import OrderByButton, { type Order, type OrderBy } from "@/shared/components/OrderByButton"
import { TablePagination } from "@/shared/components/ui/table-pagination"
import { Card, CardContent } from "@/shared/components/ui/card"
import RefreshButton from "@/shared/components/RefreshButton"
import { Skeleton } from "@/shared/components/ui/skeleton"
import SearchInput from "@/shared/components/SearchInput"
import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

interface MaintenancePlanTableProps {
	id: string
	userId: string
	hasPermission: boolean
}

export function MaintenancePlanTable({ id, userId, hasPermission }: MaintenancePlanTableProps) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [planToEdit, setPlanToEdit] = useState<MaintenancePlan | null>(null)
	const [exportLoading, setExportLoading] = useState<boolean>(false)
	const [sorting, setSorting] = useState<SortingState>([])
	const [orderBy, setOrderBy] = useState<OrderBy>("name")
	const [order, setOrder] = useState<Order>("asc")
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(1)

	const debouncedSearch = useDebounce(search)

	const { data, isLoading, refetch, isFetching } = useMaintenancePlans({
		page,
		order,
		orderBy,
		limit: 20,
		search: debouncedSearch,
	})

	const table = useReactTable<MaintenancePlan>({
		data: data?.maintenancePlans ?? [],
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		columns: MaintenancePlanColumns({ userId }),
		getPaginationRowModel: getPaginationRowModel(),
		state: {
			sorting,
			columnFilters,
			pagination: {
				pageIndex: page - 1,
				pageSize: 20,
			},
		},
		manualPagination: true,
		pageCount: data?.pages ?? 0,
	})

	const handleExportToExcel = useCallback(async () => {
		try {
			setExportLoading(true)

			const res: { maintenancePlans: (MaintenancePlan & { description?: string })[] } = await fetch(
				`/api/maintenance-plan?page=1&order=desc&orderBy=createdAt&limit=10000&includeTasks=true`
			).then((res) => res.json())

			if (!res?.maintenancePlans?.length) {
				toast.error("No hay planes de mantenimiento para exportar")
				return
			}

			const XLSX = await import("xlsx")

			const workbook = XLSX.utils.book_new()

			// Hoja principal - Planes de Mantenimiento
			const mainSheet = XLSX.utils.json_to_sheet(
				res.maintenancePlans.map((plan) => ({
					"Nombre": plan.name,
					"Descripción": plan.description || "N/A",
					"Equipo": plan.equipment?.name || "N/A",
					"Ubicación del Equipo": plan.equipment?.location || "N/A",
					"Cantidad de Tareas": plan.task?.length || 0,
					"Tareas Vencidas": plan.expiredTasksCount || 0,
					"Próximas Tareas (1 semana)": plan.nextWeekTasksCount || 0,
					"Creado por": plan.createdBy?.name || "N/A",
					"Fecha de Creación": plan.createdAt
						? format(new Date(plan.createdAt), "dd/MM/yyyy", { locale: es })
						: "N/A",
				}))
			)

			XLSX.utils.book_append_sheet(workbook, mainSheet, "Planes de Mantenimiento")

			// Hoja de Tareas - Información detallada de todas las tareas
			const allTasks = res.maintenancePlans.flatMap((plan) =>
				(plan.task || []).map((task) => ({
					"Plan de Mantenimiento": plan.name,
					"Equipo del Plan": plan.equipment?.name || "N/A",
					"Ubicación del Equipo": plan.equipment?.location || "N/A",
					"Nombre de la Tarea": task.name,
					"Equipo de la Tarea": task.equipment?.name || "N/A",
					"Próxima Fecha Programada": task.nextDate
						? format(new Date(task.nextDate), "dd/MM/yyyy", { locale: es })
						: "N/A",
					"Creado por": plan.createdBy?.name || "N/A",
					"Fecha de Creación del Plan": plan.createdAt
						? format(new Date(plan.createdAt), "dd/MM/yyyy", { locale: es })
						: "N/A",
				}))
			)

			if (allTasks.length > 0) {
				const tasksSheet = XLSX.utils.json_to_sheet(allTasks)
				XLSX.utils.book_append_sheet(workbook, tasksSheet, "Tareas Detalladas")
			}

			XLSX.writeFile(workbook, "planes-de-mantenimiento.xlsx")
			toast.success("Planes de mantenimiento exportados exitosamente")
		} catch (error) {
			console.error("[EXPORT_EXCEL]", error)
			toast.error("Error al exportar planes de mantenimiento")
		} finally {
			setExportLoading(false)
		}
	}, [])

	const prefetchMaintenancePlan = (slug: string) => {
		return queryClient.prefetchQuery({
			queryKey: [
				"maintenance-plans-tasks",
				{
					page: 1,
					limit: 20,
					search: "",
					frequency: "",
					planSlug: slug,
					nextDateTo: "",
					nextDateFrom: "",
					order: "asc" as const,
					orderBy: "name" as const,
				},
			],
			queryFn: (fn) =>
				fetchMaintenancePlanTasks({
					...fn,
					queryKey: [
						"maintenance-plans-tasks",
						{
							page: 1,
							limit: 20,
							search: "",
							frequency: "",
							planSlug: slug,
							nextDateTo: "",
							nextDateFrom: "",
							order: "asc" as const,
							orderBy: "name" as const,
						},
					],
				}),
			staleTime: 5 * 60 * 1000,
		})
	}

	return (
		<Card id={id}>
			<CardContent className="flex w-full flex-col items-start gap-4">
				{planToEdit && (
					<MaintenancePlanForm
						userId={userId}
						initialData={{
							name: planToEdit.name,
							equipmentId: planToEdit.equipment.id,
							slug: planToEdit.slug,
						}}
						onClose={() => setPlanToEdit(null)}
					/>
				)}
				<div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex w-full flex-col gap-2 md:flex-row md:items-center">
						<SearchInput
							value={search}
							className="w-80"
							setPage={setPage}
							onChange={setSearch}
							inputClassName="bg-background"
							placeholder="Buscar por nombre o RUT de empresa..."
						/>
					</div>

					<div className="flex items-center gap-2">
						<OrderByButton
							onChange={(orderBy, order) => {
								setOrderBy(orderBy)
								setOrder(order)
							}}
						/>

						<RefreshButton refetch={refetch} isFetching={isFetching} />

						{hasPermission && (
							<Button
								size={"lg"}
								onClick={handleExportToExcel}
								className="bg-purple-600 hover:bg-purple-700 hover:text-white"
							>
								{exportLoading ? <Spinner /> : <FileSpreadsheetIcon className="h-4 w-4" />}
								Exportar
							</Button>
						)}
					</div>
				</div>

				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="hover:bg-transparent">
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
										<TableCell colSpan={10}>
											<Skeleton className="h-6.5 min-w-full" />
										</TableCell>
									</TableRow>
								))
							: table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
										onMouseEnter={() => prefetchMaintenancePlan(row.original.slug)}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										))}
									</TableRow>
								))}
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
