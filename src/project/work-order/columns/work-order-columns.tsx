import { ColumnDef } from "@tanstack/react-table"
import { getImageProps } from "next/image"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"
import {
	UserIcon,
	EyeIcon,
	MailIcon,
	PhoneIcon,
	Building2Icon,
	ChevronRightIcon,
} from "lucide-react"

import { WORK_ORDER_STATUS, WORK_ORDER_TYPE, WORK_ORDER_PRIORITY } from "@prisma/client"
import { WorkOrderPriorityLabels } from "@/lib/consts/work-order-priority"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"
import { cn } from "@/lib/utils"

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/shared/components/ui/hover-card"
import UpdateWorkOrderForm from "@/project/work-order/components/forms/UpdateWorkOrderForm"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu"
import ActionDataMenu from "@/shared/components/ActionDataMenu"
import { Progress } from "@/shared/components/ui/progress"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"

import type { WorkOrder } from "@/project/work-order/hooks/use-work-order"

export const getWorkOrderColumns = ({
	setSelectedId,
	setDialogDetailsOpen,
}: {
	setSelectedId: (id: string) => void
	setDialogDetailsOpen: (open: boolean) => void
}): ColumnDef<WorkOrder>[] => [
	{
		id: "actions",
		header: "",
		cell: ({ row }) => {
			return (
				<ActionDataMenu>
					<>
						<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
							<UpdateWorkOrderForm workOrderId={row.original.id} />
						</DropdownMenuItem>
					</>
				</ActionDataMenu>
			)
		},
	},
	{
		accessorKey: "id",
		cell: ({ row }) => {
			return (
				<Button
					size={"icon"}
					variant={"ghost"}
					onClick={() => {
						setDialogDetailsOpen(true)
						setSelectedId(row.original.id)
					}}
					className="size-8 font-semibold text-amber-600 hover:bg-amber-600 hover:text-white hover:underline"
				>
					<EyeIcon className="size-4" />
				</Button>
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
			const company = row.original.company

			const { props } = getImageProps({
				width: 32,
				height: 32,
				alt: company?.name || "",
				src: company?.image || "",
			})

			return (
				<HoverCard openDelay={200}>
					<HoverCardTrigger className="text-text flex cursor-pointer items-center gap-1.5 select-none hover:underline">
						<Building2Icon className="text-muted-foreground min-h-3.5 max-w-3.5 min-w-3.5" />
						<span className="line-clamp-1 w-52 truncate">{company?.name || "Interno"}</span>
					</HoverCardTrigger>

					<HoverCardContent className="flex gap-2" side="top">
						<Avatar>
							<AvatarImage {...props} />
							<AvatarFallback>{company?.name?.slice(0, 2) || ""}</AvatarFallback>
						</Avatar>

						<div className="flex flex-col gap-2">
							<div className="text-text">
								<p className="font-bold">{company?.name || ""}</p>
								<p className="text-muted-foreground text-sm">{company?.rut || ""}</p>
							</div>

							<Link
								href={`/admin/dashboard/empresas/${company?.id}`}
								className="flex items-center text-sm text-orange-500 hover:underline"
							>
								Ver detalles
								<ChevronRightIcon className="size-4" />
							</Link>
						</div>
					</HoverCardContent>
				</HoverCard>
			)
		},
	},
	{
		accessorKey: "supervisor",
		header: "Supervisor",
		cell: ({ row }) => {
			const supervisor = row.original.supervisor

			const { props } = getImageProps({
				width: 32,
				height: 32,
				alt: supervisor.name || "",
				src: supervisor.image || "",
			})

			return (
				<HoverCard openDelay={200}>
					<HoverCardTrigger className="text-text flex cursor-pointer items-center gap-1.5 select-none hover:underline">
						<UserIcon className="text-muted-foreground min-h-3.5 max-w-3.5 min-w-3.5" />
						<span className="line-clamp-1 w-52 truncate">{supervisor?.name || "Interno"}</span>
					</HoverCardTrigger>

					<HoverCardContent className="flex w-fit gap-2" side="top">
						<Avatar>
							<AvatarImage {...props} />
							<AvatarFallback>{supervisor?.name?.slice(0, 2) || ""}</AvatarFallback>
						</Avatar>

						<div className="flex flex-col gap-2">
							<div className="text-text">
								<p className="font-bold">{supervisor?.name || ""}</p>
								<p className="text-muted-foreground text-sm">{supervisor?.rut || ""}</p>
								<p className="mt-2 flex items-center gap-1 text-sm font-semibold">
									<MailIcon className="mt-0.5 size-3" />
									{supervisor?.email || ""}
								</p>
								{supervisor.phone && (
									<p className="mt-1 flex items-center gap-1 text-sm font-semibold">
										<PhoneIcon className="size-3" />
										{supervisor.phone}
									</p>
								)}
							</div>
						</div>
					</HoverCardContent>
				</HoverCard>
			)
		},
	},
	{
		accessorKey: "workRequest",
		header: "Trabajo Solicitado",
		cell: ({ row }) => {
			const request = row.getValue("workRequest") as string
			return <div className="line-clamp-1 w-72 max-w-72 truncate">{request}</div>
		},
	},
	{
		accessorKey: "progress",
		header: "Progreso",
		cell: ({ row }) => {
			const progress = row.getValue("progress") as number

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
						"bg-emerald-600/10 text-emerald-600": status === WORK_ORDER_STATUS.COMPLETED,
						"bg-orange-500/10 text-orange-500": status === WORK_ORDER_STATUS.IN_PROGRESS,
						"bg-orange-600/10 text-orange-600": status === WORK_ORDER_STATUS.CLOSURE_REQUESTED,
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
		header: "Fecha programada - finalización",
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
			const count = row.getValue("_count") as { workBookEntries: number }

			return <div className="font-medium">{count.workBookEntries}</div>
		},
	},
]
