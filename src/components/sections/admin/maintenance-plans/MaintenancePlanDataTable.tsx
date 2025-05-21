"use client"

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

import { MaintenancePlanColumns } from "./maintenance-plan-columns"
import {
	type MaintenancePlan,
	useMaintenancePlans,
} from "@/hooks/maintenance-plans/use-maintenance-plans"

import { TablePagination } from "@/components/ui/table-pagination"
import RefreshButton from "@/components/shared/RefreshButton"
import { Skeleton } from "@/components/ui/skeleton"
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
import { useRouter } from "next/navigation"
import { queryClient } from "@/lib/queryClient"
import { fetchMaintenancePlanTasks } from "@/hooks/maintenance-plans/use-maintenance-plans-tasks"

export function MaintenancePlanDataTable() {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

	const router = useRouter()

	const { data, isLoading, refetch, isFetching } = useMaintenancePlans({
		page,
		search,
		limit: 15,
	})

	const table = useReactTable<MaintenancePlan>({
		data: data?.maintenancePlans ?? [],
		columns: MaintenancePlanColumns,
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

	const handleRowClick = (slug: string) => {
		router.push(`/admin/dashboard/planes-de-mantenimiento/${slug}/tareas`)
	}

	const prefetchMaintenancePlan = (slug: string) => {
		return queryClient.prefetchQuery({
			queryKey: ["maintenance-plans-tasks", { planSlug: slug, page: 1, limit: 15, search: "" }],
			queryFn: (fn) =>
				fetchMaintenancePlanTasks({
					...fn,
					queryKey: ["maintenance-plans-tasks", { planSlug: slug, page: 1, limit: 15, search: "" }],
				}),
			staleTime: 5 * 60 * 1000,
		})
	}

	return (
		<section className="flex w-full flex-col items-start gap-4">
			<div className="flex w-full flex-row items-start gap-2 md:items-center md:justify-between">
				<Input
					type="text"
					value={search}
					onChange={(e) => {
						setSearch(e.target.value)
						setPage(1)
					}}
					className="bg-background w-full lg:w-80"
					placeholder="Buscar por nombre, equipo, o descripcion..."
				/>

				<RefreshButton refetch={refetch} isFetching={isFetching} />
			</div>

			<Card className="w-full max-w-full rounded-md border p-1.5">
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
										<TableCell colSpan={9}>
											<Skeleton className="h-6.5 min-w-full" />
										</TableCell>
									</TableRow>
								))
							: table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										className="cursor-pointer"
										data-state={row.getIsSelected() && "selected"}
										onClick={() => handleRowClick(row.original.slug)}
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
