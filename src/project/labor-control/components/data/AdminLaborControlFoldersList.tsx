"use client"

import { InfoIcon, FilterXIcon, FileSpreadsheetIcon } from "lucide-react"
import { useCallback, useRef, useState } from "react"

import { useLaborControlFolderFilters } from "../../hooks/use-labor-control-folder-filters"

import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import SearchInput from "@/shared/components/SearchInput"
import { Button } from "@/shared/components/ui/button"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	useReactTable,
} from "@tanstack/react-table"
import { CompanyWithLaborControlFolder } from "../../hooks/use-companies-with-labor-control-folder"
import { companyWithLaborControlColumns } from "../../columns/company-with-labor-control-columns"
import RefreshButton from "@/shared/components/RefreshButton"
import Spinner from "@/shared/components/Spinner"
import { TablePagination } from "@/shared/components/ui/table-pagination"
import OrderByButton from "@/shared/components/OrderByButton"
import { queryClient } from "@/lib/queryClient"
import { fetchLaborControlFolderByCompany } from "../../hooks/use-labor-control-folder-by-company"
import { useRouter } from "next/navigation"
import { generateSlug } from "@/lib/generateSlug"

interface AdminLaborControlFoldersListProps {
	id: string
}

export default function AdminLaborControlFoldersList({ id }: AdminLaborControlFoldersListProps) {
	const [exportLoading] = useState<boolean>(false)
	const [rowSelection, setRowSelection] = useState({})

	const router = useRouter()

	const { filters, refetch, actions, isLoading, isFetching, companies, pages, total } =
		useLaborControlFolderFilters()

	const table = useReactTable<CompanyWithLaborControlFolder>({
		data: companies ?? [],
		getCoreRowModel: getCoreRowModel(),
		onRowSelectionChange: setRowSelection,
		getFilteredRowModel: getFilteredRowModel(),
		columns: companyWithLaborControlColumns,

		state: {
			pagination: {
				pageSize: filters.limit,
				pageIndex: filters.page - 1,
			},
			rowSelection,
		},
		manualPagination: true,
		pageCount: pages ?? 0,
	})

	const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	const debouncedPrefetchLaborControlByCompanyId = useCallback(
		(companyId: string) => {
			if (prefetchTimeoutRef.current) {
				clearTimeout(prefetchTimeoutRef.current)
			}

			prefetchTimeoutRef.current = setTimeout(() => {
				queryClient.prefetchQuery({
					queryKey: [
						"laborControlFolderByCompany",
						{
							companyId,
							limit: filters.limit,
							page: filters.page,
							order: filters.order,
							orderBy: filters.orderBy,
						},
					],
					queryFn: (fn) =>
						fetchLaborControlFolderByCompany({
							...fn,
							queryKey: [
								"laborControlFolderByCompany",
								{
									companyId,
									limit: filters.limit,
									page: filters.page,
									order: filters.order,
									orderBy: filters.orderBy,
								},
							],
						}),
					staleTime: 5 * 60 * 1000,
				})
			}, 300)
		},
		[filters.limit, filters.order, filters.orderBy, filters.page]
	)

	const handleClick = (companyId: string, companyName: string) => {
		const slug = generateSlug(companyName)

		router.push(`/admin/dashboard/control-laboral/${slug}_${companyId}`)
	}

	return (
		<Card id={id}>
			<CardContent className="flex w-full flex-col items-start gap-4">
				<div className="flex w-full flex-wrap items-center gap-2 md:w-full md:flex-row">
					<div className="flex flex-col">
						<h2 className="text-xl font-semibold lg:text-2xl">Lista de Empresas</h2>
						<p className="text-muted-foreground text-sm">
							Gestión y seguimiento de todas las empresas con carpetas de control laboral
						</p>
					</div>

					<SearchInput
						value={filters.search}
						setPage={actions.setPage}
						onChange={actions.setSearch}
						className="ml-auto w-full md:w-60"
						placeholder="Buscar por nº de OT, trabajo..."
					/>

					<OrderByButton
						className="h-10"
						initialOrder={filters.order}
						onChange={actions.setOrderBy}
						initialOrderBy={filters.orderBy}
					/>

					<Button
						variant="outline"
						onClick={actions.resetFilters}
						className="h-10 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
					>
						<FilterXIcon />
						Limpiar Filtros
					</Button>

					<Button
						size={"lg"}
						// onClick={handleExportToExcel}
						className="bg-blue-600 hover:bg-blue-700"
					>
						{exportLoading ? <Spinner /> : <FileSpreadsheetIcon className="h-4 w-4" />}
						Exportar
					</Button>

					<RefreshButton refetch={refetch} isFetching={isFetching} />
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
									<TableCell className="" colSpan={17}>
										<Skeleton className="h-16 min-w-full" />
									</TableCell>
								</TableRow>
							))
						) : table.getRowModel().rows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={17} className="h-20 text-center">
									<div className="flex items-center justify-center gap-2">
										<InfoIcon className="size-4" />
										No se encontraron resultados.
									</div>
								</TableCell>
							</TableRow>
						) : (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className="cursor-pointer"
									data-state={row.getIsSelected() && "selected"}
									onClick={() => handleClick(row.original.id, row.original.name)}
									onMouseEnter={() => debouncedPrefetchLaborControlByCompanyId(row.original.id)}
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

				<TablePagination
					table={table}
					total={total ?? 0}
					isLoading={isLoading}
					pageCount={pages ?? 0}
					onPageChange={actions.setPage}
					className="border-blue-600 text-blue-600 hover:bg-blue-600"
				/>
			</CardContent>
		</Card>
	)
}
