"use client"

import { FileSpreadsheetIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
	flexRender,
	useReactTable,
	getCoreRowModel,
	type SortingState,
	getFilteredRowModel,
	type ColumnFiltersState,
} from "@tanstack/react-table"

import { updateWorkRequestStatus } from "@/project/work-request/actions/update-work-request-status"
import { updateWorkRequestUrgency } from "@/project/work-request/actions/update-work-request-urgency"
import { useWorkRequests, WorkRequest } from "@/project/work-request/hooks/use-work-request"
import { getWorkRequestColumns } from "../../columns/work-request-columns"
import { queryClient } from "@/lib/queryClient"

import WorkRequestDetailsDialog from "../dialogs/WorkRequestDetailsDialog"
import { TablePagination } from "@/shared/components/ui/table-pagination"
import { Card, CardContent } from "@/shared/components/ui/card"
import RefreshButton from "@/shared/components/RefreshButton"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import Spinner from "@/shared/components/Spinner"
import CommentDialog from "./CommentDialog"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"
import {
	Select,
	SelectItem,
	SelectLabel,
	SelectGroup,
	SelectValue,
	SelectTrigger,
	SelectContent,
	SelectSeparator,
} from "@/shared/components/ui/select"

import type { WORK_REQUEST_STATUS } from "@prisma/client"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface WorkRequestsTableProps {
	id: string
	hasPermission: boolean
}

export default function WorkRequestsTable({ hasPermission, id }: WorkRequestsTableProps) {
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
	const [exportLoading, setExportLoading] = useState<boolean>(false)

	const { data, refetch, isLoading, isFetching } = useWorkRequests({
		page,
		search,
		status,
		isUrgent,
		limit: 15,
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

				queryClient.invalidateQueries({
					queryKey: ["workRequests"],
				})
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

	const handleUrgencyUpdate = async (id: string, isUrgent: boolean) => {
		setIsStatusLoading(true)

		try {
			const result = await updateWorkRequestUrgency({
				id,
				isUrgent,
			})

			if (result.error) {
				toast.error("Error", {
					description: result.error,
				})
			} else if (result.success) {
				toast.success("Éxito", {
					description: result.success,
				})

				queryClient.invalidateQueries({
					queryKey: ["workRequests"],
				})
			}
		} catch (err: unknown) {
			console.error("Error al actualizar la urgencia de la solicitud:", err)
			toast.error("Error", {
				description: "Error al actualizar la urgencia de la solicitud",
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

	const table = useReactTable({
		data: data?.workRequests ?? [],
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		columns: getWorkRequestColumns({
			hasPermission,
			isStatusLoading,
			handleStatusUpdate,
			handleUrgencyUpdate,
			handleOpenDetails,
			handleOpenComment,
		}),
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

	const handleExportToExcel = async () => {
		try {
			setExportLoading(true)

			const res: { workRequests: WorkRequest[] } = await fetch(
				`/api/work-request?page=1&limit=10000`
			).then((res) => res.json())
			if (!res?.workRequests?.length) {
				toast.error("No hay solicitudes de trabajo para exportar")
				return
			}

			const XLSX = await import("xlsx")

			const statusText = (status: WORK_REQUEST_STATUS) => {
				switch (status) {
					case "REPORTED":
						return "Reportada"
					case "APPROVED":
						return "Aprobada"
					case "ATTENDED":
						return "Atendida"
					case "CANCELLED":
						return "Cancelada"
					default:
						return status
				}
			}

			const workbook = XLSX.utils.book_new()
			const worksheet = XLSX.utils.json_to_sheet(
				res?.workRequests.map((workRequest: WorkRequest) => ({
					"N° Solicitud": workRequest.requestNumber,
					"Solicitante": workRequest.operator?.name || workRequest.user.name,
					"Descripción": workRequest.description,
					"Estado": statusText(workRequest.status),
					"Fecha de solicitud": format(new Date(workRequest.requestDate), "dd/MM/yyyy HH:mm", {
						locale: es,
					}),
					"Urgente": workRequest.isUrgent ? "Sí" : "No",
					"Equipos": workRequest.equipments.map((eq) => eq.name).join(", "),
					"Comentarios": workRequest.comments.map((com) => com.content).join(", "),
				}))
			)

			XLSX.utils.book_append_sheet(workbook, worksheet, "Solicitudes de Trabajo")
			XLSX.writeFile(workbook, "solicitudes-de-trabajo.xlsx")
			toast.success("Solicitudes de trabajo exportadas exitosamente")
		} catch (error) {
			console.error("[EXPORT_EXCEL]", error)
			toast.error("Error al exportar solicitudes de trabajo")
		} finally {
			setExportLoading(false)
		}
	}

	return (
		<>
			<Card id={id}>
				<CardContent className="flex w-full flex-col items-start gap-4">
					<div className="flex w-fit flex-col flex-wrap items-start gap-2 md:w-full md:flex-row">
						<div className="flex flex-col">
							<h2 className="text-text- text-2xl font-semibold">Lista de solicitudes de trabajo</h2>
							<p className="text-muted-foreground text-sm">
								Lista de todas las solicitudes de trabajo disponibles
							</p>
						</div>

						<div className="ml-auto flex items-center gap-2">
							<Button
								onClick={handleExportToExcel}
								disabled={isLoading || exportLoading || !data?.workRequests?.length}
								className="hidden cursor-pointer gap-1 bg-cyan-500 text-white transition-all hover:scale-105 hover:bg-cyan-600 hover:text-white md:flex"
							>
								{exportLoading ? <Spinner /> : <FileSpreadsheetIcon className="h-4 w-4" />}
								Exportar
							</Button>

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
									if (value === "true") {
										setIsUrgent(true)
									} else if (value === "false") {
										setIsUrgent(false)
									} else {
										setIsUrgent(null)
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
								</TableRow>
							))}
						</TableHeader>

						<TableBody>
							{isLoading || isFetching ? (
								Array.from({ length: 10 }).map((_, index) => (
									<TableRow key={index}>
										<TableCell colSpan={11}>
											<Skeleton className="h-14 min-w-full" />
										</TableCell>
									</TableRow>
								))
							) : table.getRowModel().rows.length === 0 ? (
								<TableRow>
									<TableCell colSpan={11} className="h-24 text-center">
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
						className="border-cyan-500 text-cyan-500 hover:bg-cyan-500"
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
