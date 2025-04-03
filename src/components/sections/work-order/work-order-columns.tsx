import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

import type { WorkOrder } from "@/hooks/use-work-order"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"
import { WorkOrderPriorityLabels } from "@/lib/consts/work-order-priority"
import { WorkOrderCAPEXLabels } from "@/lib/consts/work-order-capex"
import { WORK_ORDER_STATUS, WORK_ORDER_TYPE, WORK_ORDER_PRIORITY } from "@prisma/client"
import { cn } from "@/lib/utils"

export const workOrderColumns: ColumnDef<WorkOrder>[] = [
	{
		accessorKey: "otNumber",
		enableHiding: false,
		header: "N° OT",
		cell: ({ row }) => {
			const otNumber = row.getValue("otNumber") as string

			return <div className="font-medium">{otNumber}</div>
		},
	},
	{
		accessorKey: "solicitationDate",
		header: "Fecha de solicitud",
		cell: ({ row }) => {
			const date = row.getValue("solicitationDate") as Date

			return (
				<div className="font-medium">
					{date ? format(date, "dd/MM/yyyy", { locale: es }) : "Sin fecha"}
				</div>
			)
		},
	},
	{
		accessorKey: "status",
		header: "Estado",
		cell: ({ row }) => {
			const status = row.getValue("status") as WORK_ORDER_STATUS

			return (
				<Badge
					className={cn("bg-primary/5 border-primary text-primary", {
						"border-yellow-500 bg-yellow-500/5 text-yellow-500":
							status === WORK_ORDER_STATUS.PENDING,
						"border-green-500 bg-green-500/5 text-green-500":
							status === WORK_ORDER_STATUS.COMPLETED,
						"border-red-500 bg-red-500/5 text-red-500":
							status === WORK_ORDER_STATUS.CANCELLED || status === WORK_ORDER_STATUS.EXPIRED,
					})}
				>
					{WorkOrderStatusLabels[status]}
				</Badge>
			)
		},
	},
	{
		accessorKey: "type",
		header: "Tipo de obra",
		cell: ({ row }) => {
			const type = row.getValue("type") as WORK_ORDER_TYPE
			return <div className="font-medium">{WorkOrderTypeLabels[type]}</div>
		},
	},
	{
		accessorKey: "solicitationTime",
		header: "Hora de solicitud",
		cell: ({ row }) => {
			const time = row.getValue("solicitationTime") as string
			return <div className="font-medium">{time || "Sin hora"}</div>
		},
	},
	{
		accessorKey: "workRequest",
		header: "Trabajo Solicitado",
		cell: ({ row }) => {
			const request = row.getValue("workRequest") as string
			return <div className="font-medium">{request}</div>
		},
	},
	{
		accessorKey: "workDescription",
		header: "Descripción del trabajo",
		cell: ({ row }) => {
			const description = row.getValue("workDescription") as string
			return <div className="font-medium">{description}</div>
		},
	},
	{
		accessorKey: "equipment",
		header: "Equipo",
		cell: ({ row }) => {
			const equipment = row.getValue("equipment") as { name: string }[]

			return (
				<div className="font-medium">
					{equipment.length > 0 ? equipment.map((e) => e.name).join(" - ") : "Sin equipo"}
				</div>
			)
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
		accessorKey: "priority",
		header: "Prioridad",
		cell: ({ row }) => {
			const priority = row.getValue("priority") as WORK_ORDER_PRIORITY

			return (
				<Badge
					className={cn("bg-primary/5 border-primary text-primary", {
						"border-red-500 bg-red-500/5 text-red-500": priority === WORK_ORDER_PRIORITY.HIGH,
						"border-yellow-500 bg-yellow-500/5 text-yellow-500":
							priority === WORK_ORDER_PRIORITY.MEDIUM,
						"border-green-500 bg-green-500/5 text-green-500": priority === WORK_ORDER_PRIORITY.LOW,
					})}
				>
					{WorkOrderPriorityLabels[priority]}
				</Badge>
			)
		},
	},
	{
		accessorKey: "capex",
		header: "CAPEX",
		cell: ({ row }) => {
			const capex = row.getValue("capex") as keyof typeof WorkOrderCAPEXLabels | null

			if (!capex) return <div className="font-medium">-</div>

			return (
				<Badge variant="outline" className="border-primary text-primary">
					{WorkOrderCAPEXLabels[capex]}
				</Badge>
			)
		},
	},
	{
		accessorKey: "programDate",
		header: "Fecha programada de inicio",
		cell: ({ row }) => {
			const date = row.getValue("programDate") as string

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
	{
		id: "actions",
		enableHiding: false,
		cell: ({ row }) => {
			const { id } = row.original

			return (
				<Button className="text-primary bg-primary/10 hover:bg-primary/50" size="icon" asChild>
					<Link href={`/admin/dashboard/libros-de-obras/${id}`}>
						<ArrowUpRight className="h-4 w-4" />
					</Link>
				</Button>
			)
		},
	},
]
