"use client"

import { useRouter } from "next/navigation"
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

import { fetchMaintenancePlanTasks } from "@/project/maintenance-plan/hooks/use-maintenance-plans-tasks"
import MaintenancePlanForm from "../forms/MaintenancePlanForm"
import { MaintenancePlanColumns } from "../../columns/maintenance-plan-columns"
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
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

interface MaintenancePlanTableProps {
	userId: string
}

export function MaintenancePlanTable({ userId }: MaintenancePlanTableProps) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])
	const [orderBy, setOrderBy] = useState<OrderBy>("name")
	const [order, setOrder] = useState<Order>("asc")
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(1)
	const [planToEdit, setPlanToEdit] = useState<MaintenancePlan | null>(null)

	const router = useRouter()

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
		columns: MaintenancePlanColumns,
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
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

	const handleRowClick = (slug: string, equipmentId: string) => {
		router.push(`/admin/dashboard/planes-de-mantenimiento/${slug + "_" + equipmentId}/tareas`)
	}

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
						},
					],
				}),
			staleTime: 5 * 60 * 1000,
		})
	}

	return (
		<Card>
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
										className="cursor-pointer"
										data-state={row.getIsSelected() && "selected"}
										onClick={() => handleRowClick(row.original.slug, row.original.equipment.id)}
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
