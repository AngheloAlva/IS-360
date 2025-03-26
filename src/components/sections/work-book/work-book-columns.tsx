"use client"

import { ArrowUpDown, Link as LinkIcon } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"

import { WorkOrderStatus } from "@/lib/consts/work-order-status"
import { WorkOrderType } from "@/lib/consts/work-order-types"

import { Progress } from "@/components/ui/progress"

import type { Equipment, WorkOrder } from "@prisma/client"

export const workBookColumns: ColumnDef<WorkOrder>[] = [
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
			const otNumber = row.getValue("otNumber") as string
			return <div>{otNumber}</div>
		},
	},
	{
		accessorKey: "company.name",
		header: "Contratante",
	},
	{
		accessorKey: "supervisor.name",
		header: "Supervisor de obra",
	},
	{
		accessorKey: "responsible.name",
		header: "Responsable de obra",
	},
	{
		accessorKey: "workName",
		header: "Nombre de obra",
	},
	{
		accessorKey: "equipment",
		header: "Equipo(s)",
		cell: ({ row }) => {
			const equipment = row.getValue("equipment") as Equipment[]
			return <div>{equipment?.map((e) => e.name).join(", ")}</div>
		},
	},
	{
		accessorKey: "workLocation",
		header: "Ubicación",
	},
	{
		accessorKey: "type",
		header: "Tipo de obra",
		cell: ({ row }) => {
			const type = row.getValue("type") as WorkOrder["type"]
			return <div>{WorkOrderType[type]}</div>
		},
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
		accessorKey: "estimatedEndDate",
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
			const date = row.getValue("estimatedEndDate")
			const formattedDate = format(date as Date, "dd/MM/yyyy")
			return <div>{formattedDate}</div>
		},
	},
	{
		accessorKey: "status",
		header: "Estado",
		cell: ({ row }) => {
			const status = row.getValue("status") as WorkOrder["status"]
			return <div>{WorkOrderStatus[status]}</div>
		},
	},
	{
		accessorKey: "workProgressStatus",
		header: "Estado de avance",
		cell: ({ row }) => {
			const status = row.getValue("workProgressStatus") as WorkOrder["workProgressStatus"]
			return <Progress value={status} />
		},
	},
]
