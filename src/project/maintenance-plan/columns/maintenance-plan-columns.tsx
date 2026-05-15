"use client"

import { MapPinIcon, SettingsIcon } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"

import type { MaintenancePlan } from "@/project/maintenance-plan/hooks/use-maintenance-plans"
import CreateWorkOrderForm from "@/project/work-order/components/forms/CreateWorkOrderForm"
import DeleteMaintenancePlanDialog from "../components/forms/DeleteMaintenancePlan"
import MaintenancePlanForm from "../components/forms/MaintenancePlanForm"
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu"
import ActionDataMenu from "@/shared/components/ActionDataMenu"

export const MaintenancePlanColumns = ({
	userId,
}: {
	userId: string
}): ColumnDef<MaintenancePlan>[] => [
	{
		id: "actions",
		header: "",
		meta: {
			headerTitle: "Acciones",
		},
		size: 45,
		cell: ({ row }) => {
			const tasks = row.original.task ?? []
			const taskEquipments = tasks.flatMap((task) =>
				task.equipments.length > 0 ? task.equipments : task.equipment ? [task.equipment] : []
			)

			const uniqueEquipmentIds = [...new Set(taskEquipments.map((equipment) => equipment.id))]
			const uniqueEquipmentNames = [...new Set(taskEquipments.map((equipment) => equipment.name))]
			const taskNames = tasks.map((task) => task.name)
			const taskIds = tasks.map((task) => task.id)

			return (
				<div onClick={(event) => event.stopPropagation()}>
					<ActionDataMenu>
						<>
							<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
								<MaintenancePlanForm
									userId={userId}
									initialData={{
										name: row.original.name,
										equipmentId: row.original.equipment?.id ?? "",
										slug: row.original.slug,
									}}
									className="text-muted-foreground hover:bg-accent w-full justify-start bg-transparent hover:scale-100 hover:text-white"
								/>
							</DropdownMenuItem>

							{tasks && tasks.length > 0 && (
								<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
									<CreateWorkOrderForm
										equipmentId={uniqueEquipmentIds}
										equipmentName={uniqueEquipmentNames}
										maintenancePlanTaskId={taskIds}
										initialData={{
											workRequest: row.original.name,
											description: taskNames.join(", "),
											responsibleId: row.original.createdBy.id,
											programDate: tasks[0].nextDate,
										}}
									/>
								</DropdownMenuItem>
							)}

							<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
								<DeleteMaintenancePlanDialog maintenancePlanId={row.original.id} />
							</DropdownMenuItem>
						</>
					</ActionDataMenu>
				</div>
			)
		},
	},
	{
		accessorKey: "name",
		header: "Nombre",
		meta: {
			headerTitle: "Nombre",
		},
		cell: ({ row }) => {
			const name = row.getValue("name") as string
			const slug = row.original.slug as string
			const equipmentId = row.original.equipment?.id as string

			return (
				<Link
					href={`/admin/dashboard/planes-de-mantenimiento/${slug + "_" + equipmentId}/tareas`}
					className="font-semibold text-purple-600 hover:underline"
				>
					{name || "-"}
				</Link>
			)
		},
	},
	{
		accessorKey: "equipment",
		header: "Equipo",
		meta: {
			headerTitle: "Equipo",
		},
		cell: ({ row }) => {
			const equipments = row.getValue("equipment") as MaintenancePlan["equipment"]
			return (
				<span className="flex w-96 max-w-96 items-center gap-1.5">
					<SettingsIcon className="text-muted-foreground size-4" />
					{equipments.name}
				</span>
			)
		},
	},
	{
		accessorKey: "equipmentLocation",
		header: "Ubicación del Equipo",
		meta: {
			headerTitle: "Ubicación del Equipo",
		},
		cell: ({ row }) => {
			const equipments = row.getValue("equipment") as MaintenancePlan["equipment"]
			return (
				<span className="flex items-center gap-1.5">
					<MapPinIcon className="text-muted-foreground size-4" />
					{equipments.location?.path ?? ""}
				</span>
			)
		},
	},
	{
		accessorKey: "expiredTasksCount",
		header: "Tareas Vencidas",
		meta: {
			headerTitle: "Tareas Vencidas",
		},
		cell: ({ row }) => {
			const count = row.getValue("expiredTasksCount") as MaintenancePlan["expiredTasksCount"]
			return <span className={count > 0 ? "text-red-600" : ""}>{count} Tarea(s)</span>
		},
	},
	{
		accessorKey: "nextWeekTasksCount",
		header: "Proximas Tareas (1 semana)",
		meta: {
			headerTitle: "Proximas Tareas (1 semana)",
		},
		cell: ({ row }) => {
			const count = row.getValue("nextWeekTasksCount") as MaintenancePlan["nextWeekTasksCount"]
			return <span>{count} Tarea(s)</span>
		},
	},
	{
		accessorKey: "createdBy",
		header: "Creado por",
		meta: {
			headerTitle: "Creado por",
		},
		cell: ({ row }) => {
			const createdBy = row.original.createdBy as MaintenancePlan["createdBy"]
			return <span>{createdBy.name}</span>
		},
	},
	{
		accessorKey: "createdAt",
		header: "Fecha de Creación",
		meta: {
			headerTitle: "Fecha de Creación",
		},
		cell: ({ row }) => {
			const date = row.getValue("createdAt") as Date
			return <span>{format(new Date(date), "dd-MM-yyyy")}</span>
		},
	},
]
