"use client"

import { AlertCircleIcon, CheckCircleIcon, MessageCircleIcon, XCircleIcon } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import { WORK_REQUEST_STATUS } from "@prisma/client"

import { DropdownMenuItem, DropdownMenuSeparator } from "@/shared/components/ui/dropdown-menu"
import CreateWorkOrderForm from "@/project/work-order/components/forms/CreateWorkOrderForm"
import type { WorkRequest } from "@/project/work-request/hooks/use-work-request"
import ActionDataMenu from "@/shared/components/ActionDataMenu"
import { Badge } from "@/shared/components/ui/badge"

const statusBadgeVariant = (status: WORK_REQUEST_STATUS) => {
	switch (status) {
		case "REPORTED":
			return "outline"
		case "APPROVED":
			return "secondary"
		case "ATTENDED":
			return "default"
		case "CANCELLED":
			return "destructive"
		default:
			return "secondary"
	}
}

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

interface WorkRequestColumnsProps {
	hasPermission: boolean
	isStatusLoading: boolean
	handleOpenDetails: (request: WorkRequest) => void
	handleOpenComment: (request: WorkRequest) => void
	handleStatusUpdate: (id: string, status: WORK_REQUEST_STATUS) => void
}

export const getWorkRequestColumns = ({
	isStatusLoading,
	handleOpenDetails,
	handleOpenComment,
	handleStatusUpdate,
}: WorkRequestColumnsProps): ColumnDef<WorkRequest>[] => [
	{
		accessorKey: "workOrder",
		header: "",
		cell: ({ row }) => {
			return (
				<ActionDataMenu>
					<>
						<DropdownMenuItem onClick={() => handleOpenComment(row.original)}>
							<MessageCircleIcon className="h-4 w-4" /> Comentar
						</DropdownMenuItem>

						<DropdownMenuItem asChild>
							<CreateWorkOrderForm
								workRequestId={row.original.id}
								equipmentId={[row.original.equipments[0].id]}
							/>
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						{row.original.status !== "ATTENDED" && (
							<DropdownMenuItem
								onClick={() => handleStatusUpdate(row.original.id, "ATTENDED")}
								disabled={isStatusLoading}
							>
								<CheckCircleIcon className="h-4 w-4 text-teal-500" /> Marcar como atendida
							</DropdownMenuItem>
						)}
						{row.original.status !== "CANCELLED" && (
							<DropdownMenuItem
								onClick={() => handleStatusUpdate(row.original.id, "CANCELLED")}
								disabled={isStatusLoading}
							>
								<XCircleIcon className="h-4 w-4 text-rose-500" /> Cancelar solicitud
							</DropdownMenuItem>
						)}
						{row.original.status !== "REPORTED" && (
							<DropdownMenuItem
								onClick={() => handleStatusUpdate(row.original.id, "REPORTED")}
								disabled={isStatusLoading}
							>
								<AlertCircleIcon className="h-4 w-4 text-amber-500" /> Marcar como reportada
							</DropdownMenuItem>
						)}
					</>
				</ActionDataMenu>
			)
		},
	},
	{
		accessorKey: "requestNumber",
		header: "N° Solicitud",
		cell: ({ row }) => {
			const requestNumber = row.original.requestNumber
			return (
				<div
					onClick={() => handleOpenDetails(row.original)}
					className="cursor-pointer text-cyan-500 hover:underline"
				>
					<span>{requestNumber}</span>
				</div>
			)
		},
	},
	{
		accessorKey: "description",
		header: "Descripción",
		cell: ({ row }) => {
			const description = row.original.description
			return <p className="w-72 max-w-72 text-wrap">{description}</p>
		},
	},
	{
		accessorKey: "userId",
		header: "Solicitante",
		cell: ({ row }) => {
			const user = row.original.user
			const operator = row.original.operator

			return operator?.name || user?.name || "Usuario desconocido"
		},
	},
	{
		accessorKey: "requestDate",
		header: "Fecha",
		cell: ({ row }) => {
			const requestDate = row.original.requestDate

			return format(new Date(requestDate), "dd/MM/yyyy HH:mm", { locale: es })
		},
	},
	{
		accessorKey: "isUrgent",
		header: "Urgente",
		cell: ({ row }) => {
			const isUrgent = row.original.isUrgent

			return isUrgent ? (
				<Badge className="bg-rose-500/10 text-rose-500">Urgente</Badge>
			) : (
				<Badge className="bg-sky-500/10 text-sky-500">No</Badge>
			)
		},
	},
	{
		accessorKey: "equipment",
		header: "Equipo / Ubicación",
		cell: ({ row }) => {
			const equipment = row.original.equipments[0]

			return <span className="w-72 max-w-72 text-wrap">{equipment?.name}</span>
		},
	},
	{
		accessorKey: "status",
		header: "Estado",
		cell: ({ row }) => {
			const status = row.original.status

			return <Badge variant={statusBadgeVariant(status)}>{statusText(status)}</Badge>
		},
	},
]
