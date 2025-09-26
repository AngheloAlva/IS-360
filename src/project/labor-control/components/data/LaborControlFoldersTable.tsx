"use client"

import { InfoIcon, FileSpreadsheetIcon } from "lucide-react"
import { useState } from "react"

import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
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
import RefreshButton from "@/shared/components/RefreshButton"
import Spinner from "@/shared/components/Spinner"
import { TablePagination } from "@/shared/components/ui/table-pagination"
import OrderByButton, { Order, OrderBy } from "@/shared/components/OrderByButton"
import {
	type LaborControlFolderByCompany,
	useLaborControlFolderByCompany,
} from "../../hooks/use-labor-control-folder-by-company"
import { LaborControlFoldersByCompanyColumns } from "../../columns/labor-control-folders-by-company-columns"

interface AdminLaborControlFoldersListProps {
	companyId: string
	companySlug?: string
	isOtcMember?: boolean
}

export default function LaborControlFoldersTable({
	companyId,
	companySlug,
	isOtcMember,
}: AdminLaborControlFoldersListProps) {
	const [orderBy, setOrderBy] = useState<OrderBy>("createdAt")
	const [rowSelection, setRowSelection] = useState({})
	const [exportLoading] = useState<boolean>(false)
	const [order, setOrder] = useState<Order>("asc")
	const [page, setPage] = useState<number>(1)

	const { data, isLoading, refetch, isFetching } = useLaborControlFolderByCompany({
		page,
		order,
		orderBy,
		limit: 15,
		companyId,
	})

	const table = useReactTable<LaborControlFolderByCompany>({
		data: data?.data ?? [],
		getCoreRowModel: getCoreRowModel(),
		onRowSelectionChange: setRowSelection,
		getFilteredRowModel: getFilteredRowModel(),
		columns: LaborControlFoldersByCompanyColumns({ companyId, isOtcMember, companySlug }),
		state: {
			pagination: {
				pageSize: 15,
				pageIndex: page - 1,
			},
			rowSelection,
		},
		manualPagination: true,
		pageCount: data?.pages ?? 0,
	})

	return (
		<Card>
			<CardContent className="flex w-full flex-col items-start gap-4">
				<div className="flex w-full flex-wrap items-center gap-2 md:w-full md:flex-row">
					<div className="flex flex-col">
						<h2 className="text-xl font-semibold lg:text-2xl">Lista de carpetas</h2>
					</div>

					<OrderByButton
						initialOrder={order}
						className="ml-auto h-10"
						initialOrderBy={orderBy}
						onChange={(orderBy, order) => {
							setOrderBy(orderBy)
							setOrder(order)
						}}
					/>

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
						{isLoading ? (
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
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
					isLoading={isLoading}
					onPageChange={setPage}
					total={data?.total ?? 0}
					pageCount={data?.pages ?? 0}
					className="border-blue-600 text-blue-600 hover:bg-blue-600"
				/>
			</CardContent>
		</Card>
	)
}
