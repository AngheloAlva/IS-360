"use client"

import { useSearchParams } from "next/navigation"
import { ArrowLeft, InfoIcon, CalendarIcon } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
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
	type MaintenancePlanTask,
	useMaintenancePlanTasks,
} from "@/hooks/maintenance-plans/use-maintenance-plans-tasks"
import { MaintenancePlanTaskColumns } from "./maintenance-plan-task-columns"
import { TaskFrequencyOptions } from "@/lib/consts/task-frequency"

import { TablePagination } from "@/components/ui/table-pagination"
import RefreshButton from "@/components/shared/RefreshButton"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/components/ui/table"

export function MaintenancePlanTaskDataTable({ planSlug }: { planSlug: string }) {
	const searchParams = useSearchParams()
	const parentId = searchParams.get("parentId")

	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [frequency, setFrequency] = useState("")
	const [nextDateFrom, setNextDateFrom] = useState<Date | undefined>(undefined)
	const [nextDateTo, setNextDateTo] = useState<Date | undefined>(undefined)
	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

	const { data, isLoading, refetch, isFetching } = useMaintenancePlanTasks({
		page,
		search,
		planSlug,
		frequency,
		nextDateFrom: nextDateFrom ? format(nextDateFrom, "yyyy-MM-dd") : "",
		nextDateTo: nextDateTo ? format(nextDateTo, "yyyy-MM-dd") : "",
		limit: 15,
	})

	const table = useReactTable<MaintenancePlanTask>({
		data: data?.tasks ?? [],
		columns: MaintenancePlanTaskColumns,
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
								{/* <SelectItem value="">Todas</SelectItem> */}
								{TaskFrequencyOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center gap-2">
						<RefreshButton refetch={refetch} isFetching={isFetching} />
					</div>
				</div>

				<div className="flex w-full flex-col gap-2 md:flex-row md:items-center">
					<div className="flex items-center gap-2">
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

						{(nextDateFrom || nextDateTo || frequency) && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setNextDateFrom(undefined)
									setNextDateTo(undefined)
									setFrequency("")
									setPage(1)
								}}
							>
								Limpiar filtros
							</Button>
						)}
					</div>
				</div>
			</div>

			<Card className="w-full max-w-full rounded-md border p-1.5">
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
									<TableCell colSpan={10}>
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
								<TableCell colSpan={10} className="h-24">
									<div className="flex w-full items-center justify-center gap-2 font-semibold">
										<InfoIcon className="mr-2 h-4 w-4" />
										No hay tareas asignadas
									</div>
								</TableCell>
							</TableRow>
						)}
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
