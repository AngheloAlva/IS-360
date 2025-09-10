"use client"

import { ArrowLeft, InfoIcon, CalendarIcon, FunnelXIcon, FileSpreadsheetIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useState, useCallback } from "react"
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

import { MaintenancePlanTaskColumns } from "@/project/maintenance-plan/columns/maintenance-plan-task-columns"
import MaintenanceTaskOrderByButton, {
	type MaintenanceTaskOrder,
	type MaintenanceTaskOrderBy,
} from "./MaintenanceTaskOrderByButton"
import { TaskFrequencyOptions } from "@/lib/consts/task-frequency"
import {
	type MaintenancePlanTask,
	useMaintenancePlanTasks,
} from "@/project/maintenance-plan/hooks/use-maintenance-plans-tasks"

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { TablePagination } from "@/shared/components/ui/table-pagination"
import { Card, CardContent } from "@/shared/components/ui/card"
import RefreshButton from "@/shared/components/RefreshButton"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Calendar } from "@/shared/components/ui/calendar"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import Spinner from "@/shared/components/Spinner"
import {
	Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent,
} from "@/shared/components/ui/select"
import {
	Table,
	TableRow,
	TableCell,
	TableHead,
	TableBody,
	TableHeader,
} from "@/shared/components/ui/table"

interface MaintenancePlanTaskTableProps {
	planSlug: string
	userId: string
	hasPermission?: boolean
}

export function MaintenancePlanTaskTable({
	planSlug,
	userId,
	hasPermission = false,
}: MaintenancePlanTaskTableProps) {
	const searchParams = useSearchParams()
	const parentId = searchParams.get("parentId")

	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [frequency, setFrequency] = useState("")
	const [nextDateFrom, setNextDateFrom] = useState<Date | undefined>(undefined)
	const [nextDateTo, setNextDateTo] = useState<Date | undefined>(undefined)
	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [orderBy, setOrderBy] = useState<MaintenanceTaskOrderBy>("name")
	const [order, setOrder] = useState<MaintenanceTaskOrder>("asc")
	const [exportLoading, setExportLoading] = useState<boolean>(false)

	const { data, isLoading, refetch, isFetching } = useMaintenancePlanTasks({
		page,
		search,
		planSlug,
		frequency,
		nextDateFrom: nextDateFrom ? format(nextDateFrom, "yyyy-MM-dd") : "",
		nextDateTo: nextDateTo ? format(nextDateTo, "yyyy-MM-dd") : "",
		order,
		orderBy,
		limit: 15,
	})

	const handleExportToExcel = useCallback(async () => {
		try {
			setExportLoading(true)

			const res: { tasks: MaintenancePlanTask[] } = await fetch(
				`/api/maintenance-plan/${planSlug}/tasks?page=1&limit=10000`
			).then((res) => res.json())

			if (!res?.tasks?.length) {
				toast.error("No hay tareas para exportar")
				return
			}

			const XLSX = await import("xlsx")
			const { TaskFrequencyLabels } = await import("@/lib/consts/task-frequency")

			const workbook = XLSX.utils.book_new()

			// Hoja de Tareas de Mantenimiento
			const tasksSheet = XLSX.utils.json_to_sheet(
				res.tasks.map((task) => ({
					"Nombre de la Tarea": task.name,
					"Descripción": task.description || "N/A",
					"Equipo": task.equipment?.name || "N/A",
					"Ubicación del Equipo": task.equipment?.location || "N/A",
					"Frecuencia": TaskFrequencyLabels[task.frequency] || "N/A",
					"Próxima Ejecución": task.nextDate
						? format(new Date(task.nextDate), "dd/MM/yyyy", { locale: es })
						: "N/A",
					"OTs Creadas": task._count?.workOrders || 0,
					"Es Automatizada": task.isAutomated ? "Sí" : "No",
					"Supervisor Automatizado": task.automatedSupervisorId ? "Configurado" : "N/A",
					"Tipo OT Automatizada": task.automatedWorkOrderType || "N/A",
					"Prioridad Automatizada": task.automatedPriority || "N/A",
					"CAPEX Automatizado": task.automatedCapex || "N/A",
					"Días Estimados": task.automatedEstimatedDays || "N/A",
					"Horas Estimadas": task.automatedEstimatedHours || "N/A",
					"Descripción Trabajo": task.automatedWorkDescription || "N/A",
					"Emails de Copia": task.emailsForCopy?.join(", ") || "N/A",
					"Adjuntos": task.attachments?.map((att) => att.name).join(", ") || "Sin adjuntos",
					"Creado por": task.createdBy?.name || "N/A",
					"Fecha de Creación": task.createdAt
						? format(new Date(task.createdAt), "dd/MM/yyyy", { locale: es })
						: "N/A",
				}))
			)

			XLSX.utils.book_append_sheet(workbook, tasksSheet, "Tareas de Mantenimiento")

			const fileName = `tareas-mantenimiento-${planSlug}.xlsx`
			XLSX.writeFile(workbook, fileName)
			toast.success("Tareas de mantenimiento exportadas exitosamente")
		} catch (error) {
			console.error("[EXPORT_TASKS_EXCEL]", error)
			toast.error("Error al exportar tareas de mantenimiento")
		} finally {
			setExportLoading(false)
		}
	}, [planSlug])

	const table = useReactTable<MaintenancePlanTask>({
		data: data?.tasks ?? [],
		columns: MaintenancePlanTaskColumns({
			userId,
			maintenancePlanSlug: planSlug,
		}),
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
		<Card>
			<CardContent className="flex w-full flex-col items-start gap-4">
				<div className="flex w-full flex-col gap-4">
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

					<div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div className="flex w-full flex-col gap-2 md:flex-row md:items-center">
							<Input
								type="text"
								value={search}
								onChange={(e) => {
									setSearch(e.target.value)
									setPage(1)
								}}
								className="bg-background w-full md:w-64"
								placeholder="Buscar por nombre o equipo..."
							/>

							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={`w-full justify-start text-left font-normal md:w-52 ${!nextDateFrom && "text-muted-foreground"}`}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{nextDateFrom ? format(nextDateFrom, "PPP", { locale: es }) : "Fecha inicial"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={nextDateFrom}
										onSelect={(date) => {
											setNextDateFrom(date)
											setPage(1)
										}}
										initialFocus
									/>
								</PopoverContent>
							</Popover>

							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={`w-full justify-start text-left font-normal md:w-52 ${!nextDateTo && "text-muted-foreground"}`}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{nextDateTo ? format(nextDateTo, "PPP", { locale: es }) : "Fecha final"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={nextDateTo}
										onSelect={(date) => {
											setNextDateTo(date)
											setPage(1)
										}}
										initialFocus
										disabled={(date) => (nextDateFrom ? date < nextDateFrom : false)}
									/>
								</PopoverContent>
							</Popover>

							<Select
								value={frequency}
								onValueChange={(value) => {
									setFrequency(value)
									setPage(1)
								}}
							>
								<SelectTrigger className="bg-background w-full md:w-40">
									<SelectValue placeholder="Frecuencia" />
								</SelectTrigger>
								<SelectContent>
									{TaskFrequencyOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{(nextDateFrom || nextDateTo || frequency) && (
								<Button
									size="sm"
									variant="outline"
									onClick={() => {
										setNextDateFrom(undefined)
										setNextDateTo(undefined)
										setFrequency("")
										setPage(1)
									}}
								>
									<FunnelXIcon className="h-4 w-4" />
									Limpiar filtros
								</Button>
							)}
						</div>

						<div className="flex items-center gap-2">
							<MaintenanceTaskOrderByButton
								onChange={(orderBy: MaintenanceTaskOrderBy, order: MaintenanceTaskOrder) => {
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
						{isLoading || isFetching ? (
							Array.from({ length: 10 }).map((_, index) => (
								<TableRow key={index}>
									<TableCell colSpan={11}>
										<Skeleton className="h-8 min-w-full" />
									</TableCell>
								</TableRow>
							))
						) : table.getRowModel().rows.length > 0 ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={11} className="h-24">
									<div className="flex w-full items-center justify-center gap-2 font-semibold">
										<InfoIcon className="mr-2 h-4 w-4" />
										No hay tareas asignadas
									</div>
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
