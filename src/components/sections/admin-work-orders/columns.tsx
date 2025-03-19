"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"

import type { User, WorkOrder } from "@prisma/client"
import { format } from "date-fns"

export const columns: ColumnDef<WorkOrder & { responsible?: User }>[] = [
	// {
	// 	accessorKey: "id",
	// 	header: "",
	// 	cell: ({ row }) => {
	// 		const id = row.getValue("id")
	// 		return (
	// 			<Link
	// 				href={`/dashboard/libro-de-obras/${id}`}
	// 				className="text-primary hover:text-feature text-right font-medium hover:underline"
	// 			>
	// 				<LinkIcon className="h-4 w-4" />
	// 			</Link>
	// 		)
	// 	},
	// },
	{
		accessorKey: "otNumber",
		header: "Numero de OT",
	},
	{
		accessorKey: "contractCompany",
		header: "Empresa Colaboradora",
	},
	{
		accessorKey: "initDate",
		header: "Fecha de Inicio",
		cell: ({ row }) => {
			const initDate = row.getValue("initDate") as Date
			return <span>{format(new Date(initDate), "yyyy-MM-dd")}</span>
		},
	},
	{
		accessorKey: "endDate",
		header: "Fecha de Finalización",
		cell: ({ row }) => {
			const endDate = row.getValue("endDate") as Date
			return <span>{format(new Date(endDate), "yyyy-MM-dd")}</span>
		},
	},
	{
		accessorKey: "quantityDays",
		header: "Cantidad de días",
	},
	{
		accessorKey: "estimatedDuration",
		header: "Duración estimada",
	},
	{
		accessorKey: "status",
		header: "Estado",
		cell: ({ row }) => {
			const status = row.getValue("status") as string
			return <Badge variant={"outline"}>{status}</Badge>
		},
	},
	{
		accessorKey: "type",
		header: "Tipo",
	},
	{
		accessorKey: "responsible",
		header: "Responsable",
		cell: ({ row }) => {
			const responsible = row.getValue("responsible") as User
			return <span>{responsible?.name}</span>
		},
	},
]
