import { EyeIcon } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import { WORK_ORDER_STATUS, WORK_ORDER_TYPE, WORK_ORDER_PRIORITY } from "@/generated/prisma/enums"
import { useWorkOrderSelectionStore } from "../stores/work-order-selection-store"
import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"

import { DataGridColumnHeader } from "@/shared/components/data-grid/data-grid-column-header"
import UpdateWorkOrderForm from "@/project/work-order/components/forms/UpdateWorkOrderForm"

import { WorkOrderPriorityBadge } from "@/project/work-order/components/badges/WorkOrderPriorityBadge"
import { WorkOrderStatusBadge } from "@/project/work-order/components/badges/WorkOrderStatusBadge"
import DeleteWorkOrderDialog from "@/project/work-order/components/dialogs/DeleteWorkOrderDialog"
import CompanyHoverCard from "@/shared/components/data/CompanyHoverCard"
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu"
import UserHoverCard from "@/shared/components/data/UserHoverCard"
import ActionDataMenu from "@/shared/components/ActionDataMenu"
import { Progress } from "@/shared/components/ui/progress"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Button } from "@/shared/components/ui/button"

import type { WorkOrder } from "@/project/work-order/hooks/use-work-order"
import type { ColumnDef, Row } from "@tanstack/react-table"

interface GetWorkOrderColumnsProps {
	setSelectedId: (id: string) => void
	setDialogDetailsOpen: (open: boolean) => void
	isOtcMember?: boolean
	canDelete?: boolean
}

export const getWorkOrderColumns = ({
	setSelectedId,
	setDialogDetailsOpen,
	canDelete = false,
}: GetWorkOrderColumnsProps): ColumnDef<WorkOrder>[] => [
	{
		id: "select",
		header: "",
		size: 40,
		maxSize: 40,
		cell: ({ row }: { row: Row<WorkOrder> }) => {
			// eslint-disable-next-line react-hooks/rules-of-hooks
			const { isSelected, toggleSelection } = useWorkOrderSelectionStore()
			const isCompleted = row.original.status === WORK_ORDER_STATUS.COMPLETED

			return (
				<Checkbox
					aria-label="Select row"
					checked={isSelected(row.original.id)}
					disabled={isCompleted}
					title={isCompleted ? "La OT ya está cerrada" : undefined}
					className="data-[state=checked]:border-orange-700 data-[state=checked]:bg-orange-500"
					onCheckedChange={() =>
						toggleSelection(row.original.id, row.original.otNumber, row.original.workRequest)
					}
				/>
			)
		},
		enableSorting: false,
		enableHiding: false,
		enablePinning: false,
		enableResizing: false,
		meta: {
			headerTitle: "Seleccion",
		},
	},
	{
		id: "actions",
		header: "",
		enableSorting: false,
		enableHiding: false,
		enablePinning: false,
		enableResizing: false,
		size: 52,
		maxSize: 52,
		meta: {
			headerTitle: "Acciones",
		},
		cell: ({ row }) => {
			const wo = row.original
			const isDeletable =
				canDelete &&
				(wo.status === WORK_ORDER_STATUS.PLANNED || wo.status === WORK_ORDER_STATUS.PENDING) &&
				wo._count.milestones === 0 &&
				wo._count.workBookEntries === 0

			return (
				<div onClick={(event) => event.stopPropagation()}>
					<ActionDataMenu>
						<>
							<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
								<UpdateWorkOrderForm workOrderId={wo.id} />
							</DropdownMenuItem>
							{isDeletable && (
								<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
									<DeleteWorkOrderDialog workOrderId={wo.id} otNumber={wo.otNumber} />
								</DropdownMenuItem>
							)}
						</>
					</ActionDataMenu>
				</div>
			)
		},
	},
	{
		accessorKey: "id",
		header: "Ver",
		enableSorting: false,
		meta: {
			headerTitle: "Ver",
		},
		size: 60,
		cell: ({ row }) => {
			return (
				<Button
					size={"icon"}
					variant={"ghost"}
					onClick={() => {
						setDialogDetailsOpen(true)
						setSelectedId(row.original.id)
					}}
					className="size-8 text-amber-600 hover:bg-amber-600 hover:text-white hover:underline"
				>
					<EyeIcon className="size-4" />
				</Button>
			)
		},
	},
	{
		accessorKey: "otNumber",
		enableHiding: false,
		header: ({ column }) => <DataGridColumnHeader column={column} title="Nº OT" visibility />,
		enableSorting: true,
		meta: {
			headerTitle: "Nº OT",
		},
		cell: ({ row }) => {
			const workOrder = row.original

			return (
				<div className="flex items-center gap-2">
					<Link
						href={`/admin/dashboard/ordenes-de-trabajo/${workOrder.id}`}
						className="text-orange-600 hover:underline"
					>
						{workOrder.otNumber}
					</Link>
				</div>
			)
		},
	},
	{
		accessorKey: "company",
		header: ({ column }) => <DataGridColumnHeader column={column} title="Empresa" visibility />,
		enableSorting: true,
		meta: {
			headerTitle: "Empresa",
		},
		cell: ({ row }) => {
			const company = row.original.company

			return <CompanyHoverCard {...company} href={`/admin/dashboard/empresas/${company?.id}`} />
		},
	},
	{
		accessorKey: "supervisor",
		header: ({ column }) => <DataGridColumnHeader column={column} title="Supervisor" visibility />,
		enableSorting: true,
		meta: {
			headerTitle: "Supervisor",
		},
		cell: ({ row }) => {
			const supervisor = row.original.supervisor

			return <UserHoverCard {...supervisor} />
		},
	},
	{
		accessorKey: "workRequest",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Trabajo solicitado" visibility />
		),
		enableSorting: true,
		meta: {
			headerTitle: "Trabajo solicitado",
		},
		cell: ({ row }) => {
			const request = row.getValue("workRequest") as string
			return <div className="line-clamp-1 w-72 max-w-72 truncate">{request}</div>
		},
	},
	{
		accessorKey: "progress",
		header: ({ column }) => <DataGridColumnHeader column={column} title="Progreso" visibility />,
		enableSorting: true,
		meta: {
			headerTitle: "Progreso",
		},
		cell: ({ row }) => {
			const progress = row.getValue("progress") as number

			return (
				<div className="flex w-25 items-center gap-1">
					<Progress
						value={progress || 0}
						className="h-2 bg-orange-600/10 [&>div]:bg-orange-500 dark:[&>div]:bg-orange-700"
					/>
					<span className="text-muted-foreground text-xs">{progress || 0}%</span>
				</div>
			)
		},
	},
	{
		accessorKey: "status",
		header: ({ column }) => <DataGridColumnHeader column={column} title="Estado" visibility />,
		enableSorting: true,
		meta: {
			headerTitle: "Estado",
		},
		cell: ({ row }) => {
			const status = row.getValue("status") as WORK_ORDER_STATUS

			return <WorkOrderStatusBadge status={status} />
		},
	},
	{
		accessorKey: "solicitationDate",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Fecha solicitud" visibility />
		),
		enableSorting: true,
		meta: {
			headerTitle: "Fecha solicitud",
		},
		cell: ({ row }) => {
			const date = row.getValue("solicitationDate") as Date

			return <div>{date ? format(date, "dd/MM/yyyy", { locale: es }) : "Sin fecha"}</div>
		},
	},
	{
		accessorKey: "type",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Tipo de obra" visibility />
		),
		enableSorting: true,
		meta: {
			headerTitle: "Tipo de obra",
		},
		cell: ({ row }) => {
			const type = row.getValue("type") as WORK_ORDER_TYPE
			return <div>{WorkOrderTypeLabels[type]}</div>
		},
	},
	{
		accessorKey: "priority",
		header: ({ column }) => <DataGridColumnHeader column={column} title="Prioridad" visibility />,
		enableSorting: true,
		meta: {
			headerTitle: "Prioridad",
		},
		cell: ({ row }) => {
			const priority = row.getValue("priority") as WORK_ORDER_PRIORITY

			return <WorkOrderPriorityBadge priority={priority} />
		},
	},
	{
		accessorKey: "programDate",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Fecha programada" visibility />
		),
		enableSorting: true,
		meta: {
			headerTitle: "Fecha programada",
		},
		cell: ({ row }) => {
			const date = row.getValue("programDate") as Date | null
			const endDate = row.original.estimatedEndDate

			return (
				<div>
					{date ? format(new Date(date), "dd/MM/yyyy", { locale: es }) : "Sin fecha"} {" - "}
					{endDate ? format(new Date(endDate), "dd/MM/yyyy", { locale: es }) : "Sin fecha"}
				</div>
			)
		},
	},

	{
		accessorKey: "_count",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="N actividades" visibility />
		),
		enableSorting: false,
		meta: {
			headerTitle: "N actividades",
		},
		cell: ({ row }) => {
			const count = row.getValue("_count") as { workBookEntries: number }

			return <div>{count.workBookEntries}</div>
		},
	},
]
