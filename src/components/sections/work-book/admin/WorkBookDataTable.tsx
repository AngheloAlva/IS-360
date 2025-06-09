import { useRouter } from "next/navigation"
import { useState } from "react"
import {
	flexRender,
	SortingState,
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	type ColumnFiltersState,
} from "@tanstack/react-table"

import { fetchWorkBookMilestones } from "@/hooks/work-orders/use-work-book-milestones"
import { useWorkBooks, WorkBook } from "@/hooks/work-orders/use-work-books"
import { fetchWorkBookById } from "@/hooks/work-orders/use-work-book-by-id"
import { workBookColumns } from "./work-book-columns"
import { queryClient } from "@/lib/queryClient"

import { TablePagination } from "@/components/ui/table-pagination"
import RefreshButton from "@/components/shared/RefreshButton"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/components/ui/table"

export function WorkBookDataTable() {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])

	const { data, isLoading, refetch, isFetching } = useWorkBooks({
		page,
		search,
		limit: 15,
	})

	const table = useReactTable<WorkBook>({
		data: data?.workBooks ?? [],
		columns: workBookColumns,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
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

	const router = useRouter()

	const handleRowClick = (workOrderId: string) => {
		router.push(`/admin/dashboard/libros-de-obras/${workOrderId}`)
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
		<Card>
			<CardContent className="mt-4 flex w-full flex-col items-start gap-4">
				<div className="flex w-full flex-col items-start justify-between lg:flex-row">
					<h2 className="text-text text-2xl font-bold">Lista de Libros de Obras</h2>

					<div className="my-4 flex w-full items-center justify-between gap-2 lg:my-0">
						<Input
							type="text"
							value={search}
							className="bg-background w-full sm:w-80"
							onChange={(e) => {
								setPage(1)
								setSearch(e.target.value)
							}}
							placeholder="Buscar por nombre o número de folio..."
						/>

						<RefreshButton refetch={refetch} isFetching={isFetching} />
					</div>
				</div>

				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{isLoading || isFetching
							? Array.from({ length: 15 }).map((_, index) => (
									<TableRow key={index}>
										<TableCell className="" colSpan={15}>
											<Skeleton className="h-9 min-w-full" />
										</TableCell>
									</TableRow>
								))
							: table.getRowModel().rows.map((row) => (
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
