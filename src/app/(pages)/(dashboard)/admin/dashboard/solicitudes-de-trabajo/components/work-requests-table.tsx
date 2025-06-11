"use client"

import { useState } from "react"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"

import { updateWorkRequestStatus } from "@/actions/work-requests/update-work-request-status"
import { toast } from "sonner"
import {
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	SortingState,
	useReactTable,
} from "@tanstack/react-table"
import { useWorkRequests, WorkRequest } from "@/hooks/work-request/use-work-request"
import { WorkRequestColumns } from "./work-request-columns"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import RefreshButton from "@/components/shared/RefreshButton"
import { Skeleton } from "@/components/ui/skeleton"
import { TablePagination } from "@/components/ui/table-pagination"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
	AlertCircleIcon,
	CheckCircleIcon,
	EyeIcon,
	MessageCircleIcon,
	MoreVertical,
	XCircleIcon,
} from "lucide-react"

import CommentDialog from "./comment-dialog"
import WorkRequestDetailsDialog from "./work-request-details-dialog"
import { WORK_REQUEST_STATUS } from "@prisma/client"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

export default function WorkRequestsTable() {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [status, setStatus] = useState("all")
	const [isUrgent, setIsUrgent] = useState<boolean | null>(null)
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])
	const [selectedRequest, setSelectedRequest] = useState<WorkRequest | null>(null)
	const [isDetailsOpen, setIsDetailsOpen] = useState(false)
	const [isCommentOpen, setIsCommentOpen] = useState(false)
	const [isStatusLoading, setIsStatusLoading] = useState(false)

	const { data, refetch, isLoading, isFetching } = useWorkRequests({
		page,
		search,
		status,
		isUrgent,
		limit: 10,
	})

	const table = useReactTable({
		data: data?.workRequests ?? [],
		columns: WorkRequestColumns,
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

	const handleStatusUpdate = async (id: string, status: WORK_REQUEST_STATUS) => {
		setIsStatusLoading(true)

		try {
			const result = await updateWorkRequestStatus({
				id,
				status,
			})

			if (result.error) {
				toast.error("Error", {
					description: result.error,
				})
			} else if (result.success) {
				toast.success("Éxito", {
					description: result.success,
				})

				// Recargar la página para actualizar los datos
				window.location.reload()
			}
		} catch (err: unknown) {
			console.error("Error al actualizar el estado de la solicitud:", err)
			toast.error("Error", {
				description: "Error al actualizar el estado de la solicitud",
			})
		} finally {
			setIsStatusLoading(false)
		}
	}

	const handleOpenDetails = (request: WorkRequest) => {
		setSelectedRequest(request)
		setIsDetailsOpen(true)
	}

	const handleOpenComment = (request: WorkRequest) => {
		setSelectedRequest(request)
		setIsCommentOpen(true)
	}

	return (
		<>
			<Card>
				<CardContent className="flex w-full flex-col items-start gap-4">
					<div className="flex w-fit flex-col flex-wrap items-start gap-2 md:w-full md:flex-row">
						<div className="flex flex-col">
							<h2 className="text-text- text-2xl font-semibold">Lista de solicitudes de trabajo</h2>
							<p className="text-muted-foreground text-sm">
								Lista de todas las solicitudes de trabajo disponibles
							</p>
						</div>

						<div className="ml-auto flex items-center gap-2">
							<Input
								onChange={(e) => {
									setSearch(e.target.value)
									setPage(1)
								}}
								value={search}
								className="bg-background ml-auto w-fit lg:w-72"
								placeholder="Buscar por n° de solicitud, descripción..."
							/>

							<Select
								onValueChange={(value) => {
									if (value === "all") {
										setStatus("all")
									} else {
										setStatus(value)
									}
								}}
								value={status ?? "all"}
							>
								<SelectTrigger className="border-input bg-background hover:bg-input w-full border transition-colors sm:w-fit">
									<SelectValue placeholder="Tipo de obra" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Tipo de obra</SelectLabel>
										<SelectSeparator />
										<SelectItem value="all">Todos los tipos</SelectItem>
										<SelectItem value="REPORTED">Reportada</SelectItem>
										<SelectItem value="ATTENDED">Atendida</SelectItem>
										<SelectItem value="CANCELLED">Cancelada</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>

							<Select
								onValueChange={(value) => {
									if (value === "all") {
										setIsUrgent(null)
									} else {
										setIsUrgent(value === "true")
									}
								}}
								value={isUrgent === null ? "all" : isUrgent ? "true" : "false"}
							>
								<SelectTrigger className="border-input bg-background hover:bg-input w-full border transition-colors sm:w-fit">
									<SelectValue placeholder="Urgente" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Urgente</SelectLabel>
										<SelectSeparator />
										<SelectItem value="all">Todos los tipos</SelectItem>
										<SelectItem value="true">Urgente</SelectItem>
										<SelectItem value="false">No urgente</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>

							<RefreshButton refetch={refetch} isFetching={isFetching} />
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

									<TableHead className="text-right">Acciones</TableHead>
								</TableRow>
							))}
						</TableHeader>

						<TableBody>
							{isLoading || isFetching ? (
								Array.from({ length: 10 }).map((_, index) => (
									<TableRow key={index}>
										<TableCell colSpan={9}>
											<Skeleton className="h-14 min-w-full" />
										</TableCell>
									</TableRow>
								))
							) : table.getRowModel().rows.length === 0 ? (
								<TableRow>
									<TableCell colSpan={9} className="h-24 text-center">
										No hay solicitudes de trabajo
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

										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="sm">
														<MoreVertical className="h-4 w-4" />
														<span className="sr-only">Abrir menú</span>
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem onClick={() => handleOpenDetails(row.original)}>
														<EyeIcon className="mr-2 h-4 w-4" /> Ver detalles
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleOpenComment(row.original)}>
														<MessageCircleIcon className="mr-2 h-4 w-4" /> Comentar
													</DropdownMenuItem>
													{row.original.status !== "ATTENDED" && (
														<DropdownMenuItem
															onClick={() => handleStatusUpdate(row.original.id, "ATTENDED")}
															disabled={isStatusLoading}
														>
															<CheckCircleIcon className="mr-2 h-4 w-4 text-green-600" /> Marcar
															como atendida
														</DropdownMenuItem>
													)}
													{row.original.status !== "CANCELLED" && (
														<DropdownMenuItem
															onClick={() => handleStatusUpdate(row.original.id, "CANCELLED")}
															disabled={isStatusLoading}
														>
															<XCircleIcon className="mr-2 h-4 w-4 text-red-600" /> Cancelar
															solicitud
														</DropdownMenuItem>
													)}
													{row.original.status !== "REPORTED" && (
														<DropdownMenuItem
															onClick={() => handleStatusUpdate(row.original.id, "REPORTED")}
															disabled={isStatusLoading}
														>
															<AlertCircleIcon className="mr-2 h-4 w-4 text-amber-600" /> Marcar
															como reportada
														</DropdownMenuItem>
													)}
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>

					<TablePagination
						table={table}
						isLoading={isLoading}
						onPageChange={setPage}
						pageCount={data?.pages ?? 0}
					/>
				</CardContent>
			</Card>

			{selectedRequest && (
				<WorkRequestDetailsDialog
					open={isDetailsOpen}
					workRequest={selectedRequest}
					onOpenChange={setIsDetailsOpen}
				/>
			)}

			{selectedRequest && (
				<CommentDialog
					open={isCommentOpen}
					userId={selectedRequest.userId}
					onOpenChange={setIsCommentOpen}
					workRequestId={selectedRequest.id}
				/>
			)}
		</>
	)
}
