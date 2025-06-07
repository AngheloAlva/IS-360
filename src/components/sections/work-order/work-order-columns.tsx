import { ColumnDef } from "@tanstack/react-table"
import { LinkIcon } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import { WORK_ORDER_STATUS, WORK_ORDER_TYPE, WORK_ORDER_PRIORITY } from "@prisma/client"
import { WorkOrderPriorityLabels } from "@/lib/consts/work-order-priority"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { WorkOrderCAPEXLabels } from "@/lib/consts/work-order-capex"
import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"
import { cn } from "@/lib/utils"

import UpdateWorkOrderForm from "@/components/forms/admin/work-order/UpdateWorkOrderForm"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import type { WorkOrder } from "@/hooks/work-orders/use-work-order"

export const workOrderColumns: ColumnDef<WorkOrder>[] = [
	{
		accessorKey: "otNumber",
		enableHiding: false,
		header: "N° OT",
		cell: ({ row }) => {
			const id = row.original.id

			return (
				<Link
					href={`/admin/dashboard/libros-de-obras/${id}`}
					className="font-medium text-orange-500 hover:underline"
				>
					<div className="font-medium">{row.getValue("otNumber")}</div>
				</Link>
			)
		},
	},
	{
		accessorKey: "company",
		header: "Empresa - Supervisor",
		cell: ({ row }) => {
			const company = row.getValue("company") as { name: string } | null
			const supervisor = row.original.supervisor as { name: string } | null

			return (
				<div className="font-medium">
					{company?.name ? company.name : "Interno"} - {supervisor?.name}
				</div>
			)
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
			return <div className="max-w-80 min-w-80 font-medium text-wrap">{description}</div>
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
		accessorKey: "equipment",
		header: "Equipo",
		cell: ({ row }) => {
			const equipment = row.getValue("equipment") as { name: string }[]

			return (
				<ul className="flex flex-col">
					{equipment.length > 0
						? equipment.map((e) => <li key={e.name}>{e.name}</li>)
						: "Sin equipo"}
				</ul>
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
		accessorKey: "_count",
		header: "Actividades Realizadas",
		cell: ({ row }) => {
			const count = row.getValue("_count") as { workEntries: number }

			return <div className="font-medium">{count.workEntries}</div>
		},
	},
	{
		accessorKey: "initReport",
		header: "Reporte Inicial",
		cell: ({ row }) => {
			const report = row.original.initReport as { url: string } | null

			return (
				<Button
					size="icon"
					variant="outline"
					disabled={!report}
					className="text-primary bg-primary/10 hover:bg-primary/50 border-primary hover:text-white disabled:cursor-not-allowed disabled:border-none disabled:bg-neutral-500/20 disabled:text-neutral-500"
				>
					<Link
						target="_blank"
						className="font-medium"
						rel="noopener noreferrer"
						href={report ? report.url : "#"}
					>
						<LinkIcon className="h-4 w-4" />
					</Link>
				</Button>
			)
		},
	},
	{
		accessorKey: "endReport",
		header: "Reporte Final",
		cell: ({ row }) => {
			const report = row.original.endReport as { url: string } | null

			return (
				<Button
					size="icon"
					variant="outline"
					disabled={!report}
					className="text-primary bg-primary/10 hover:bg-primary/50 border-primary hover:text-white disabled:cursor-not-allowed disabled:border-none disabled:bg-neutral-500/20 disabled:text-neutral-500"
				>
					<Link
						target="_blank"
						className="font-medium"
						rel="noopener noreferrer"
						href={report ? report.url : "#"}
					>
						<LinkIcon className="h-4 w-4" />
					</Link>
				</Button>
			)
		},
	},
	{
		id: "actions",
		header: "Acciones",
		cell: ({ row }) => {
			return <UpdateWorkOrderForm workOrder={row.original} />
		},
	},
]
