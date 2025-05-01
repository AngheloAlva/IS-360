"use client"

import { useSearchParams } from "next/navigation"
import { ArrowLeft, InfoIcon } from "lucide-react"
import { useState } from "react"
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

import { TablePagination } from "@/components/ui/table-pagination"
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

export function MaintenancePlanTaskDataTable({ planSlug }: { planSlug: string }) {
	const searchParams = useSearchParams()
	const parentId = searchParams.get("parentId")

	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

	const { data, isLoading } = useMaintenancePlanTasks({
		page,
		search,
		planSlug,
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
					<Input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="bg-background ml-auto w-full sm:w-72"
						placeholder="Buscar por nombre, descripcion, o equipo..."
					/>
				</div>
			</div>

			<Card className="w-full max-w-full overflow-x-scroll rounded-md border p-1.5">
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
						{isLoading ? (
							Array.from({ length: 10 }).map((_, index) => (
								<TableRow key={index}>
									<TableCell colSpan={10}>
										<Skeleton className="h-6.5 min-w-full" />
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
