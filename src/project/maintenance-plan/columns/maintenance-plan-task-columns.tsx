"use client"

import { LinkIcon, MapPinIcon, SettingsIcon } from "lucide-react"
import { differenceInDays, format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { TaskFrequencyLabels } from "@/lib/consts/task-frequency"
import { PLAN_FREQUENCY } from "@/generated/prisma/enums"
import { cn } from "@/lib/utils"
import { Badge } from "@/shared/components/ui/badge"

import type { MaintenancePlanTask } from "@/project/maintenance-plan/hooks/use-maintenance-plans-tasks"
import { DataGridColumnHeader } from "@/shared/components/data-grid/data-grid-column-header"

interface MaintenancePlanTaskColumnsProps {
	userId: string
	maintenancePlanSlug: string
}

export const MaintenancePlanTaskColumns = ({
	userId: _userId,
	maintenancePlanSlug: _maintenancePlanSlug,
}: MaintenancePlanTaskColumnsProps): ColumnDef<MaintenancePlanTask>[] => [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Nombre de la Tarea" visibility />
		),
		meta: {
			headerTitle: "Nombre de la Tarea",
		},
		size: 200,
	},

	{
		accessorKey: "description",
		header: ({ column }) => <DataGridColumnHeader column={column} title="Descripción" visibility />,
		size: 200,
		meta: {
			headerTitle: "Descripción",
		},
		cell: ({ row }) => {
			const description = row.getValue("description") as string
			return <p className="w-64 max-w-64 text-wrap">{description || "-"}</p>
		},
	},
	{
		accessorKey: "_count",
		header: "OTs Creadas",
		cell: ({ row }) => {
			const count = row.getValue("_count") as MaintenancePlanTask["_count"]
			return <span>{count.workOrders}</span>
		},
	},
	{
		accessorKey: "frequency",
		header: ({ column }) => <DataGridColumnHeader column={column} title="Frecuencia" visibility />,
		meta: {
			headerTitle: "Frecuencia",
		},
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
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Proxima Ejecución" visibility />
		),
		meta: {
			headerTitle: "Proxima Ejecución",
		},
		size: 150,
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
		header: ({ column }) => <DataGridColumnHeader column={column} title="Equipos" visibility />,
		size: 200,
		meta: {
			headerTitle: "Equipos",
		},
		cell: ({ row }) => {
			const equipments =
				row.original.equipments.length > 0 ? row.original.equipments : [row.original.equipment]
			return (
				<span className="flex w-96 max-w-96 items-center gap-1.5">
					<SettingsIcon className="text-muted-foreground size-4 min-w-4" />
					{equipments.map((equipment) => equipment.name).join(", ")}
				</span>
			)
		},
	},
	{
		accessorKey: "equipmentLocation",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Ubicación de Equipos" visibility />
		),
		size: 200,
		meta: {
			headerTitle: "Ubicación de Equipos",
		},
		cell: ({ row }) => {
			const equipments =
				row.original.equipments.length > 0 ? row.original.equipments : [row.original.equipment]
			const locations = [...new Set(equipments.map((equipment) => equipment.location?.path ?? ""))]
			return (
				<span className="flex items-center gap-1.5">
					<MapPinIcon className="text-muted-foreground size-4 min-w-4" />
					{locations.join(", ")}
				</span>
			)
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
								onClick={(event) => event.stopPropagation()}
								className="text-primary flex items-center gap-1 hover:underline"
							>
								{attachment.name}
								<LinkIcon className="size-4 min-w-4" />
							</Link>
						</li>
					))}
				</ul>
			)
		},
	},
	{
		accessorKey: "createdBy",
		header: ({ column }) => <DataGridColumnHeader column={column} title="Creado por" visibility />,
		meta: {
			headerTitle: "Creado por",
		},
		cell: ({ row }) => {
			const createdBy = row.original.createdBy as MaintenancePlanTask["createdBy"]
			return <span>{createdBy.name}</span>
		},
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Fecha de Creación" visibility />
		),
		meta: {
			headerTitle: "Fecha de Creación",
		},
		cell: ({ row }) => {
			const date = row.getValue("createdAt") as Date
			return <span>{format(new Date(date), "dd-MM-yyyy")}</span>
		},
	},
]
