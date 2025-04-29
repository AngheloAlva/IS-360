import { ColumnDef } from "@tanstack/react-table"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { WORK_ORDER_STATUS } from "@prisma/client"
import { cn } from "@/lib/utils"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

import type { WorkBook } from "@/hooks/work-orders/use-work-books"

export const workBookColumns: ColumnDef<WorkBook>[] = [
	{
		accessorKey: "otNumber",
		header: "N° OT",
		cell: ({ row }) => {
			const otNumber = row.getValue("otNumber") as string
			const id = row.original.id

			return (
				<Link
					href={`/admin/dashboard/libros-de-obras/${id}`}
					className="text-primary hover:text-feature text-right font-medium hover:underline"
				>
					{otNumber}
				</Link>
			)
		},
	},
	{
		accessorKey: "workName",
		header: "Nombre del trabajo",
		cell: ({ row }) => {
			const workName = row.getValue("workName") as string

			return <div className="font-medium">{workName || "Sin nombre"}</div>
		},
	},
	{
		accessorKey: "workLocation",
		header: "Ubicación",
		cell: ({ row }) => {
			const location = row.getValue("workLocation") as string

			return <div className="font-medium">{location || "Sin ubicación"}</div>
		},
	},
	{
		accessorKey: "workProgressStatus",
		header: "Progreso",
		cell: ({ row }) => {
			const progress = row.getValue("workProgressStatus") as number

			return (
				<div className="flex w-[100px] items-center gap-1">
					<Progress value={progress || 0} className="h-2" />
					<span className="text-muted-foreground text-xs">{progress || 0}%</span>
				</div>
			)
		},
	},
	{
		accessorKey: "status",
		header: "Estado",
		cell: ({ row }) => {
			const status = row.getValue("status") as keyof typeof WorkOrderStatusLabels

			return (
				<Badge
					className={cn("bg-primary/5 border-primary text-primary", {
						"border-yellow-500 bg-yellow-500/5 text-yellow-500":
							status === WORK_ORDER_STATUS.PENDING,
						"border-green-500 bg-green-500/5 text-green-500":
							status === WORK_ORDER_STATUS.COMPLETED,
						"border-red-500 bg-red-500/5 text-red-500": status === WORK_ORDER_STATUS.CANCELLED,
					})}
				>
					{WorkOrderStatusLabels[status]}
				</Badge>
			)
		},
	},
	{
		accessorKey: "workStartDate",
		header: "Fecha de inicio",
		cell: ({ row }) => {
			const date = row.getValue("workStartDate") as string

			return (
				<div className="font-medium">
					{date ? format(new Date(date), "PPP", { locale: es }) : "Sin fecha"}
				</div>
			)
		},
	},
	{
		accessorKey: "company",
		header: "Empresa",
		cell: ({ row }) => {
			const company = row.getValue("company") as { name: string }

			return <div className="font-medium">{company.name}</div>
		},
	},
	{
		accessorKey: "_count",
		header: "Entradas",
		cell: ({ row }) => {
			const count = row.getValue("_count") as { workEntries: number }

			return <div className="font-medium">{count.workEntries}</div>
		},
	},
]
