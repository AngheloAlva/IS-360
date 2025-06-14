"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import type { WorkRequest } from "@/features/work-request/hooks/use-work-request"
import { es } from "date-fns/locale"
import { Badge } from "@/shared/components/ui/badge"
import { WORK_REQUEST_STATUS } from "@prisma/client"

const statusBadgeVariant = (status: WORK_REQUEST_STATUS) => {
	switch (status) {
		case "REPORTED":
			return "outline"
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
		case "ATTENDED":
			return "Atendida"
		case "CANCELLED":
			return "Cancelada"
		default:
			return status
	}
}

export const WorkRequestColumns: ColumnDef<WorkRequest>[] = [
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
				<Badge variant="destructive">Urgente</Badge>
			) : (
				<Badge variant="outline">Normal</Badge>
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
