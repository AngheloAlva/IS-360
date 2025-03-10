"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"

import { ArrowUpDown, Link as LinkIcon } from "lucide-react"

import type { WorkBook, WorkOrder } from "@prisma/client"

export const columns: ColumnDef<WorkBook>[] = [
	{
		accessorKey: "id",
		header: "",
		cell: ({ row }) => {
			const id = row.getValue("id")
			return (
				<Link
					href={`/dashboard/libro-de-obras/${id}`}
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
		cell: ({ row }) => {
			const otNumber = row.getValue("otNumber")
			return <div>{(otNumber as WorkOrder).otNumber}</div>
		},
	},
	{
		accessorKey: "contractingCompany",
		header: "Contratante",
	},
	{
		accessorKey: "workResponsibleName",
		header: "Responsable de obra",
	},
	{
		accessorKey: "workName",
		header: "Nombre de obra",
	},
	{
		accessorKey: "workLocation",
		header: "Ubicación",
	},
	{
		accessorKey: "workType",
		header: "Tipo de obra",
	},
	{
		accessorKey: "workStartDate",
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
			const date = row.getValue("workStartDate")
			const formattedDate = format(date as Date, "dd/MM/yyyy")
			return <div>{formattedDate}</div>
		},
	},
	{
		accessorKey: "workEstimatedEndDate",
		header: ({ column }) => {
			return (
				<div
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="hover:text-primary flex cursor-pointer items-center transition-colors"
				>
					Fecha estimada de término
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</div>
			)
		},
		cell: ({ row }) => {
			const date = row.getValue("workEstimatedEndDate")
			const formattedDate = format(date as Date, "dd/MM/yyyy")
			return <div>{formattedDate}</div>
		},
	},
	{
		accessorKey: "workStatus",
		header: "Estado",
	},
	{
		accessorKey: "workProgressStatus",
		header: "Estado de avance",
	},
]
