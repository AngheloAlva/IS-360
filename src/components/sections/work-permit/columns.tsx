"use client"

import { ArrowUpDown, Link as LinkIcon } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"

import type { WorkPermit, Personnel } from "@prisma/client"

export const columns: ColumnDef<WorkPermit>[] = [
	{
		accessorKey: "id",
		header: "",
		cell: ({ row }) => {
			const id = row.getValue("id")
			return (
				<Link
					href={`/dashboard/permiso-de-trabajo/${id}`}
					className="text-primary hover:text-feature text-right font-medium hover:underline"
				>
					<LinkIcon className="h-4 w-4" />
				</Link>
			)
		},
	},
	{
		accessorKey: "otNumber",
		header: "OT",
	},
	{
		accessorKey: "aplicantPt",
		header: "Solicitante PT",
	},
	{
		accessorKey: "responsiblePt",
		header: "Responsable PT",
	},
	{
		accessorKey: "executanCompany",
		header: "Empresa ejecutora",
	},
	{
		accessorKey: "workDescription",
		header: "Descripción de la obra",
		cell: ({ row }) => {
			const description = row.getValue("workDescription")
			return <div className="truncate">{description as string}</div>
		},
	},
	{
		accessorKey: "exactPlace",
		header: "Lugar exacto",
	},
	{
		accessorKey: "initDate",
		header: ({ column }) => {
			return (
				<div
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="hover:text-primary flex cursor-pointer items-center transition-colors"
				>
					Fecha de inicio
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</div>
			)
		},
		cell: ({ row }) => {
			const date = row.getValue("initDate")
			const formattedDate = format(date as Date, "dd/MM/yyyy")
			return <div>{formattedDate}</div>
		},
	},
	{
		accessorKey: "hour",
		header: "Hora",
	},
	{
		accessorKey: "participants",
		header: "Participantes",
		cell: ({ row }) => {
			const participants: Personnel[] = row.getValue("participants")
			return (
				<div>
					{participants.length > 1
						? participants.length + " participantes"
						: participants.length + " participante"}
				</div>
			)
		},
	},
]
