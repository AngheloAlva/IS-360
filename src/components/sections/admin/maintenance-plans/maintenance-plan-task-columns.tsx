"use client"

import { TaskFrequencyLabels } from "@/lib/consts/task-frequency"
import { differenceInDays, format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"
import { LinkIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

import CreateMaintenancePlanTaskWorkOrderForm from "@/components/forms/admin/work-order/CreateMaintenancePlanTaskWorkOrderForm"
import { Badge } from "@/components/ui/badge"

import type { MaintenancePlanTask } from "@/hooks/maintenance-plans/use-maintenance-plans-tasks"
import { PLAN_FREQUENCY } from "@prisma/client"

export const MaintenancePlanTaskColumns: ColumnDef<MaintenancePlanTask>[] = [
	{
		accessorKey: "createWorkOrder",
		header: "",
		cell: ({ row }) => (
			<CreateMaintenancePlanTaskWorkOrderForm
				equipmentId={row.original.equipment.id}
				maintenancePlanTaskId={row.original.id}
				equipmentName={row.original.equipment.name}
			/>
		),
	},
	{
		accessorKey: "name",
		header: "Nombre de la Tarea",
	},
	{
		accessorKey: "description",
		header: "Descripción",
		cell: ({ row }) => {
			const description = row.getValue("description") as string
			return <p className="w-64 max-w-64 text-wrap">{description || "-"}</p>
		},
	},
	{
		accessorKey: "_count",
		header: "Ordenes de Trabajo Creadas",
		cell: ({ row }) => {
			const count = row.getValue("_count") as MaintenancePlanTask["_count"]
			return <span>{count.workOrders}</span>
		},
	},
	{
		accessorKey: "frequency",
		header: "Frecuencia",
		cell: ({ row }) => {
			const frequency = row.getValue("frequency") as MaintenancePlanTask["frequency"]
			return (
				<Badge
					className={cn("border-purple-500 bg-purple-500/10 text-purple-500", {
						"border-red-500 bg-red-500/10 text-red-500": frequency === PLAN_FREQUENCY.YEARLY,
						"border-amber-500 bg-amber-500/10 text-amber-500":
							frequency === PLAN_FREQUENCY.FOURMONTHLY,
						"border-teal-500 bg-teal-500/10 text-teal-500": frequency === PLAN_FREQUENCY.QUARTERLY,
						"border-blue-500 bg-blue-500/10 text-blue-500": frequency === PLAN_FREQUENCY.BIMONTHLY,
						"border-green-500 bg-green-500/10 text-green-500": frequency === PLAN_FREQUENCY.MONTHLY,
					})}
				>
					{TaskFrequencyLabels[frequency]}
				</Badge>
			)
		},
	},
	{
		accessorKey: "nextDate",
		header: "Proxima Ejecución",
		cell: ({ row }) => {
			const nextDate = row.getValue("nextDate") as Date
			const leftDays = differenceInDays(new Date(nextDate), new Date())

			return (
				<Badge
					className={cn({
						"border-green-500 bg-green-500/10 text-green-500": leftDays > 0,
						"border-amber-500 bg-amber-500/10 text-amber-500": leftDays <= 15,
						"border-red-500 bg-red-500/10 text-red-500": leftDays <= 0,
					})}
				>
					{format(new Date(nextDate), "dd-MM-yyyy")}
				</Badge>
			)
		},
	},
	{
		accessorKey: "equipment",
		header: "Equipo",
		cell: ({ row }) => {
			const equipment = row.original.equipment as MaintenancePlanTask["equipment"]
			return <span>{equipment.name}</span>
		},
	},
	{
		accessorKey: "attachments",
		header: "Adjuntos",
		cell: ({ row }) => {
			const attachments = row.original.attachments as MaintenancePlanTask["attachments"]
			return (
				<ul className="flex flex-col gap-1">
					{attachments.map((attachment) => (
						<li key={attachment.id}>
							<Link
								href={attachment.url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary flex items-center gap-1 hover:underline"
							>
								{attachment.name}
								<LinkIcon className="size-4" />
							</Link>
						</li>
					))}
				</ul>
			)
		},
	},
	{
		accessorKey: "createdBy",
		header: "Creado por",
		cell: ({ row }) => {
			const createdBy = row.original.createdBy as MaintenancePlanTask["createdBy"]
			return <span>{createdBy.name}</span>
		},
	},
	{
		accessorKey: "createdAt",
		header: "Fecha de Creación",
		cell: ({ row }) => {
			const date = row.getValue("createdAt") as Date
			return <span>{format(new Date(date), "dd-MM-yyyy")}</span>
		},
	},
]
