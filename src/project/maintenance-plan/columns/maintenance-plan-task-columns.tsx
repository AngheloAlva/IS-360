"use client"

import { LinkIcon, MapPinIcon, SettingsIcon } from "lucide-react"
import { differenceInDays, format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import MaintenancePlanTaskForm from "@/project/maintenance-plan/components/forms/MaintenancePlanTaskForm"
import { TaskFrequencyLabels } from "@/lib/consts/task-frequency"
import { PLAN_FREQUENCY } from "@prisma/client"
import { cn } from "@/lib/utils"

import CreateWorkOrderForm from "@/project/work-order/components/forms/CreateWorkOrderForm"
import PostponeTaskDialog from "@/project/work-order/components/forms/PostponeTask"
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu"
import ActionDataMenu from "@/shared/components/ActionDataMenu"
import { Badge } from "@/shared/components/ui/badge"

import type { MaintenancePlanTask } from "@/project/maintenance-plan/hooks/use-maintenance-plans-tasks"
import DeletePlanTaskDialog from "../components/dialogs/DeletePlanTaskDialog"

interface MaintenancePlanTaskColumnsProps {
	userId: string
	maintenancePlanSlug: string
}

export const MaintenancePlanTaskColumns = ({
	userId,
	maintenancePlanSlug,
}: MaintenancePlanTaskColumnsProps): ColumnDef<MaintenancePlanTask>[] => [
	{
		accessorKey: "actions",
		header: "",
		cell: ({ row }) => (
			<ActionDataMenu>
				<>
					<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
						<MaintenancePlanTaskForm
							userId={userId}
							maintenancePlanSlug={maintenancePlanSlug}
							equipmentId={row.original.equipment?.id ?? undefined}
							className="hover:bg-accent text-text hover:text-accent-foreground data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:hover:bg-destructive/10 dark:data-[variant=destructive]:hover:bg-destructive/40 data-[variant=destructive]:hover:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex h-fit w-full cursor-default items-center justify-start gap-2 rounded-sm bg-transparent px-2 py-1.5 text-sm outline-hidden select-none hover:scale-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
							initialData={{
								id: row.original.id,
								name: row.original.name,
								nextDate: row.original.nextDate,
								frequency: row.original.frequency,
								isAutomated: row.original.isAutomated,
								emailsForCopy: row.original.emailsForCopy,
								description: row.original.description ?? undefined,
								equipmentId: row.original.equipment?.id ?? undefined,
								automatedSupervisorId: row.original.automatedSupervisorId,
								automatedWorkOrderType: row.original.automatedWorkOrderType,
								automatedPriority: row.original.automatedPriority,
								automatedCapex: row.original.automatedCapex,
								automatedEstimatedDays: row.original.automatedEstimatedDays,
								automatedEstimatedHours: row.original.automatedEstimatedHours,
								automatedWorkDescription: row.original.automatedWorkDescription,
							}}
						/>
					</DropdownMenuItem>

					<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
						<PostponeTaskDialog taskId={row.original.id} nextDate={row.original.nextDate} />
					</DropdownMenuItem>

					<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
						<CreateWorkOrderForm
							equipmentId={[row.original.equipment.id]}
							maintenancePlanTaskId={[row.original.id]}
							equipmentName={[row.original.equipment.name]}
							initialData={{
								workRequest: row.original.name,
								programDate: row.original.nextDate,
								responsibleId: row.original.createdBy.id,
								description: row.original.description ?? "",
							}}
						/>
					</DropdownMenuItem>

					<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
						<DeletePlanTaskDialog
							taskId={row.original.id}
							maintenancePlanSlug={maintenancePlanSlug}
						/>
					</DropdownMenuItem>
				</>
			</ActionDataMenu>
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
		header: "OTs Creadas",
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
			return (
				<span className="flex items-center gap-1.5">
					<SettingsIcon className="text-muted-foreground size-4" />
					{equipment.name}
				</span>
			)
		},
	},
	{
		accessorKey: "equipmentLocation",
		header: "Ubicación del Equipo",
		cell: ({ row }) => {
			const equipments = row.getValue("equipment") as MaintenancePlanTask["equipment"]
			return (
				<span className="flex items-center gap-1.5">
					<MapPinIcon className="text-muted-foreground size-4" />
					{equipments.location}
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
