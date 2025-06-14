import { Building2Icon, DotIcon, LinkIcon, UserIcon } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import { WORK_ORDER_STATUS, WORK_ORDER_TYPE, WORK_ORDER_PRIORITY } from "@prisma/client"
import { WorkOrderPriorityLabels } from "@/lib/consts/work-order-priority"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { WorkOrderCAPEXLabels } from "@/lib/consts/work-order-capex"
import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"
import { cn } from "@/lib/utils"

import UpdateWorkOrderForm from "@/features/work-order/components/forms/UpdateWorkOrderForm"
import { Progress } from "@/shared/components/ui/progress"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"

import type { WorkOrder } from "@/features/work-order/hooks/use-work-order"

export const workOrderColumns: ColumnDef<WorkOrder>[] = [
	{
		accessorKey: "otNumber",
		enableHiding: false,
		header: "N° OT",
		cell: ({ row }) => {
			const id = row.original.id

			return (
				<Link
					href={`/admin/dashboard/ordenes-de-trabajo/${id}`}
					className="font-semibold text-orange-600 hover:underline"
				>
					{row.getValue("otNumber")}
				</Link>
			)
		},
	},
	{
		accessorKey: "company",
		header: "Empresa - Supervisor",
		cell: ({ row }) => {
			const company = row.getValue("company") as { name: string } | null

			return (
				<div className="flex items-center gap-2">
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
				<div className="flex items-center gap-2">
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
			return <div className="w-80 max-w-80 text-wrap">{request}</div>
		},
	},
	{
		accessorKey: "workDescription",
		header: "Descripción del trabajo",
		cell: ({ row }) => {
			const description = row.getValue("workDescription") as string
			return <div className="w-80 max-w-80 text-wrap">{description}</div>
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
						"bg-orange-700/10 text-orange-700": status === WORK_ORDER_STATUS.COMPLETED,
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
		accessorKey: "equipment",
		header: "Equipos/Ubicaciones",
		cell: ({ row }) => {
			const equipment = row.getValue("equipment") as { name: string; id: string }[]

			return (
				<ul className="flex flex-col">
					{equipment.length > 0
						? equipment.map((e) => (
								<li key={e.id} className="flex items-center gap-1">
									<DotIcon className="size-4" />
									{e.name}
								</li>
							))
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
		accessorKey: "capex",
		header: "CAPEX",
		cell: ({ row }) => {
			const capex = row.getValue("capex") as keyof typeof WorkOrderCAPEXLabels | null

			if (!capex) return <div className="font-medium">-</div>

			return (
				<Badge className="bg-orange-600/10 text-orange-600">{WorkOrderCAPEXLabels[capex]}</Badge>
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
