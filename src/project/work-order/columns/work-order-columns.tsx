import { Building2Icon, EyeIcon, LinkIcon, UserIcon } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import WorkOrderDetailsDialog from "@/project/work-order/components/dialogs/WorkOrderDetailsDialog"

import { WORK_ORDER_STATUS, WORK_ORDER_TYPE, WORK_ORDER_PRIORITY } from "@prisma/client"
import { WorkOrderPriorityLabels } from "@/lib/consts/work-order-priority"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"
import { cn } from "@/lib/utils"

import UpdateWorkOrderForm from "@/project/work-order/components/forms/UpdateWorkOrderForm"
import { Progress } from "@/shared/components/ui/progress"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"

import type { WorkOrder } from "@/project/work-order/hooks/use-work-order"

export const workOrderColumns: ColumnDef<WorkOrder>[] = [
	{
		accessorKey: "id",
		cell: ({ row }) => {
			const workOrder = row.original

			return (
				<WorkOrderDetailsDialog workOrder={workOrder}>
					<Button
						variant={"ghost"}
						size={"icon"}
						className="size-9 font-semibold text-amber-600 hover:bg-amber-600 hover:text-white hover:underline"
					>
						<EyeIcon className="size-4" />
					</Button>
				</WorkOrderDetailsDialog>
			)
		},
	},
	{
		accessorKey: "otNumber",
		enableHiding: false,
		header: "N° OT",
		cell: ({ row }) => {
			const workOrder = row.original

			return (
				<div className="flex items-center gap-2">
					<Link
						href={`/admin/dashboard/ordenes-de-trabajo/${workOrder.id}`}
						className="font-semibold text-orange-600 hover:underline"
					>
						{workOrder.otNumber}
					</Link>
				</div>
			)
		},
	},
	{
		accessorKey: "company",
		header: "Nombre de la empresa",
		cell: ({ row }) => {
			const company = row.getValue("company") as { name: string } | null

			return (
				<div className="flex w-64 max-w-56 items-center gap-2 text-wrap">
					<Building2Icon className="text-muted-foreground h-4 w-4" />
					{company?.name ? company.name : "Interno"}
				</div>
			)
		},
	},
	{
		accessorKey: "supervisor",
		header: "Supervisor",
		cell: ({ row }) => {
			const supervisor = row.getValue("supervisor") as { name: string } | null

			return (
				<div className="flex w-64 max-w-56 items-center gap-2 text-wrap">
					<UserIcon className="text-muted-foreground h-4 w-4" />
					{supervisor?.name}
				</div>
			)
		},
	},
	{
		accessorKey: "workRequest",
		header: "Trabajo Solicitado",
		cell: ({ row }) => {
			const request = row.getValue("workRequest") as string
			return <div className="w-72 max-w-72 text-wrap">{request}</div>
		},
	},
	{
		accessorKey: "workProgressStatus",
		header: "Progreso",
		cell: ({ row }) => {
			const progress = row.getValue("workProgressStatus") as number

			return (
				<div className="flex w-[100px] items-center gap-1">
					<Progress
						value={progress || 0}
						className="h-2 bg-orange-600/10"
						indicatorClassName="bg-orange-600"
					/>
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
					className={cn("bg-yellow-500/10 text-yellow-500", {
						"bg-orange-500/10 text-orange-500": status === WORK_ORDER_STATUS.IN_PROGRESS,
						"bg-orange-600/10 text-orange-600": status === WORK_ORDER_STATUS.CLOSURE_REQUESTED,
						"bg-red-600/10 text-red-600": status === WORK_ORDER_STATUS.PENDING,
						"bg-emerald-600/10 text-emerald-600": status === WORK_ORDER_STATUS.COMPLETED,
						"bg-red-700/10 text-red-700": status === WORK_ORDER_STATUS.CANCELLED,
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
		accessorKey: "priority",
		header: "Prioridad",
		cell: ({ row }) => {
			const priority = row.getValue("priority") as WORK_ORDER_PRIORITY

			return (
				<Badge
					className={cn("bg-yellow-500/10 text-yellow-500", {
						"bg-red-500/10 text-red-500": priority === WORK_ORDER_PRIORITY.HIGH,
						"bg-orange-500/10 text-orange-500": priority === WORK_ORDER_PRIORITY.MEDIUM,
					})}
				>
					{WorkOrderPriorityLabels[priority]}
				</Badge>
			)
		},
	},
	{
		accessorKey: "programDate",
		header: "Fecha programada - Fecha finalización",
		cell: ({ row }) => {
			const date = row.getValue("programDate") as Date | null
			const endDate = row.original.estimatedEndDate

			return (
				<div className="font-medium">
					{date ? format(new Date(date), "dd/MM/yyyy", { locale: es }) : "Sin fecha"} {" - "}
					{endDate ? format(new Date(endDate), "dd/MM/yyyy", { locale: es }) : "Sin fecha"}
				</div>
			)
		},
	},

	{
		accessorKey: "_count",
		header: "N° Actividades",
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
					className="hover:bg-orange-amber/50 border-amber-500 bg-amber-500/10 text-amber-500 hover:text-white disabled:cursor-not-allowed disabled:border-none disabled:bg-neutral-500/20 disabled:text-neutral-500"
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
					className="hover:bg-orange-amber/50 border-amber-500 bg-amber-500/10 text-amber-500 hover:text-white disabled:cursor-not-allowed disabled:border-none disabled:bg-neutral-500/20 disabled:text-neutral-500"
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
