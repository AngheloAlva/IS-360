"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"

import { WORK_ORDER_STATUS, type WORK_ORDER_TYPE } from "@prisma/client"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"

import { Progress } from "@/shared/components/ui/progress"
import { Badge } from "@/shared/components/ui/badge"

import type { WorkBookByCompany } from "@/project/work-order/hooks/use-work-books-by-company"

export const workBookColumns: ColumnDef<WorkBookByCompany>[] = [
	{
		accessorKey: "otNumber",
		header: "OT",
		cell: ({ row }) => {
			const otNumber = row.getValue("otNumber") as string
			const id = row.original.id
			return (
				<Link
					href={`/dashboard/libro-de-obras/${id}`}
					className="text-primary hover:text-feature font-medium hover:underline"
				>
					{otNumber}
				</Link>
			)
		},
	},
	{
		accessorKey: "supervisor.name",
		header: "Supervisor de obra",
	},
	{
		accessorKey: "responsible.name",
		header: "Responsable de OTC",
	},
	{
		accessorKey: "workBookName",
		header: "Nombre de obra",
	},
	{
		accessorKey: "workBookStartDate",
		header: "Fecha de inicio",
		cell: ({ row }) => {
			const date = row.getValue("workBookStartDate") as Date | null
			const formattedDate = date ? format(date, "dd/MM/yyyy") : "No iniciada"
			return <div>{formattedDate}</div>
		},
	},
	{
		accessorKey: "estimatedEndDate",
		header: "Fecha estimada de término",
		cell: ({ row }) => {
			const date = row.getValue("estimatedEndDate") as Date | null
			const formattedDate = date ? format(date, "dd/MM/yyyy") : ""
			return <div>{formattedDate}</div>
		},
	},
	{
		accessorKey: "status",
		header: "Estado",
		cell: ({ row }) => {
			const status = row.getValue("status") as WORK_ORDER_STATUS
			return (
				<Badge
					className={cn("border-slate-500 bg-slate-500/10 text-slate-500", {
						"border-purple-500 bg-purple-500/10 text-purple-500":
							status === WORK_ORDER_STATUS.IN_PROGRESS,
						"border-cyan-500 bg-cyan-500/10 text-cyan-500":
							status === WORK_ORDER_STATUS.CLOSURE_REQUESTED,
						"border-yellow-500 bg-yellow-500/10 text-yellow-500":
							status === WORK_ORDER_STATUS.PENDING,
						"border-green-500 bg-green-500/10 text-green-500":
							status === WORK_ORDER_STATUS.COMPLETED,
						"border-red-500 bg-red-500/10 text-red-500": status === WORK_ORDER_STATUS.CANCELLED,
					})}
				>
					{WorkOrderStatusLabels[status]}
				</Badge>
			)
		},
	},
	{
		accessorKey: "progress",
		header: "Estado de avance",
		cell: ({ row }) => {
			const status = row.getValue("progress") as number
			return <Progress value={status} />
		},
	},
	{
		accessorKey: "equipment",
		header: "Equipo(s)",
		cell: ({ row }) => {
			const equipment = row.original.equipment
			return (
				<ul>
					{equipment.map((e) => (
						<li key={e.name}>{e.name}</li>
					))}
				</ul>
			)
		},
	},
	{
		accessorKey: "workBookLocation",
		header: "Ubicación",
	},
	{
		accessorKey: "type",
		header: "Tipo de obra",
		cell: ({ row }) => {
			const type = row.getValue("type") as WORK_ORDER_TYPE
			return <div>{WorkOrderTypeLabels[type]}</div>
		},
	},
]
