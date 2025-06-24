"use client"

import { ColumnDef } from "@tanstack/react-table"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import { WORK_REQUEST_STATUS } from "@prisma/client"

import CreateWorkOrderForm from "@/project/work-order/components/forms/CreateWorkOrderForm"
import type { WorkRequest } from "@/project/work-request/hooks/use-work-request"
import ApproveWorkRequest from "../components/forms/ApproveWorkRequest"
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

export const getWorkRequestColumns = (hasPermission: boolean): ColumnDef<WorkRequest>[] => [
	{
		accessorKey: "workOrder",
		header: "Orden de trabajo",
		cell: ({ row }) => {
			const status = row.original.status

			return hasPermission && status === "APPROVED" ? (
				<CreateWorkOrderForm
					workRequestId={row.original.id}
					className="h-8 bg-cyan-500 text-white hover:bg-cyan-600"
				/>
			) : (
				hasPermission && status === "REPORTED" && (
					<ApproveWorkRequest userId={row.original.userId} workRequestId={row.original.id} />
				)
			)
		},
	},
	{
		accessorKey: "requestNumber",
		header: "N° Solicitud",
	},
	{
		accessorKey: "description",
		header: "Descripción",
	},
	{
		accessorKey: "userId",
		header: "Solicitante",
		cell: ({ row }) => {
			const user = row.original.user

			return user?.name || "Usuario desconocido"
		},
	},
	{
		accessorKey: "companyId",
		header: "Empresa",
		cell: ({ row }) => {
			const company = row.original.user?.company

			return company?.name || "N/A"
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
		accessorKey: "location",
		header: "Ubicación",
		cell: ({ row }) => {
			const location = row.original.location

			return location === "OTHER" && row.original.customLocation
				? row.original.customLocation
				: row.original.location
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
