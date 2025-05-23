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

import { workBookColumns } from "./work-book-columns"
import {
	useWorkBooksByCompany,
	type WorkBookByCompany,
} from "@/hooks/work-orders/use-work-books-by-company"

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
import { InfoIcon } from "lucide-react"
import { queryClient } from "@/lib/queryClient"
import { fetchWorkBookById } from "@/hooks/work-orders/use-work-book-by-id"
import { fetchWorkBookMilestones } from "@/hooks/work-orders/use-work-book-milestones"
import { useRouter } from "next/navigation"

export function WorkBookDataTable({ companyId }: { companyId: string }) {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])

	const { data, isLoading, refetch, isFetching } = useWorkBooksByCompany({
		page,
		search,
		companyId,
		limit: 10,
		onlyBooks: true,
	})

	const table = useReactTable({
		columns: workBookColumns,
		data: data?.workBooks ?? [],
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		state: {
			sorting,
			columnFilters,
		},
	})

	const router = useRouter()

	const handleRowClick = (workOrderId: string) => {
		router.push(`/dashboard/libro-de-obras/${workOrderId}`)
	}

	const prefetchWorkBookById = (workOrderId: string) => {
		queryClient.prefetchQuery({
			queryKey: ["workBooks", { workOrderId }],
			queryFn: (fn) =>
				fetchWorkBookById({
					...fn,
					queryKey: ["workBooks", { workOrderId }],
				}),
			staleTime: 5 * 60 * 1000,
		})

		queryClient.prefetchQuery({
			queryKey: ["workBookMilestones", { workOrderId, showAll: true }],
			queryFn: (fn) =>
				fetchWorkBookMilestones({
					...fn,
					queryKey: ["workBookMilestones", { workOrderId, showAll: true }],
				}),
			staleTime: 5 * 60 * 1000,
		})
	}

	return (
		<section className="flex w-full flex-col gap-4">
			<div className="flex w-full flex-col items-start justify-between gap-2 lg:flex-row">
				<div className="flex w-full items-center justify-between gap-2">
					<Input
						value={search}
						className="bg-background w-full sm:w-80"
						placeholder="Filtrar por Numero de OT..."
						onChange={(e) => {
							setSearch(e.target.value)
							setPage(1)
						}}
					/>
					<RefreshButton refetch={refetch} isFetching={isFetching} />
				</div>
			</div>

			<Card className="w-full max-w-full overflow-x-scroll rounded-md border-none p-1.5">
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
									<TableCell className="" colSpan={12}>
										<Skeleton className="h-9 min-w-full" />
									</TableCell>
								</TableRow>
							))
						) : table.getRowModel().rows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={12} className="h-24 text-center font-semibold">
									<div className="flex w-full items-center justify-center gap-2">
										<InfoIcon className="h-5 w-5" />
										No hay libros de obras registrados
									</div>
								</TableCell>
							</TableRow>
						) : (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className="cursor-pointer"
									data-state={row.getIsSelected() && "selected"}
									onClick={() => handleRowClick(row.original.id)}
									onMouseEnter={() => prefetchWorkBookById(row.original.id)}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} className="font-medium">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</Card>

			<TablePagination<WorkBookByCompany>
				table={table}
				isLoading={isLoading}
				onPageChange={setPage}
				pageCount={data?.pages ?? 0}
			/>
		</section>
	)
}
