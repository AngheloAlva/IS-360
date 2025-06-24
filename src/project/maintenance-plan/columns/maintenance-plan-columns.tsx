"use client"

import { MapPinIcon, SettingsIcon } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import type { MaintenancePlan } from "@/project/maintenance-plan/hooks/use-maintenance-plans"

export const MaintenancePlanColumns: ColumnDef<MaintenancePlan>[] = [
	{
		accessorKey: "name",
		header: "Nombre",
		cell: ({ row }) => {
			const name = row.getValue("name") as string
			return <span className="font-semibold text-purple-600">{name || "-"}</span>
		},
	},
	{
		accessorKey: "equipment",
		header: "Equipo",
		cell: ({ row }) => {
			const equipments = row.getValue("equipment") as MaintenancePlan["equipment"]
			return (
				<span className="flex items-center gap-1.5">
					<SettingsIcon className="text-muted-foreground size-4" />
					{equipments.name}
				</span>
			)
		},
	},
	{
		accessorKey: "equipmentLocation",
		header: "Ubicación del Equipo",
		cell: ({ row }) => {
			const equipments = row.getValue("equipment") as MaintenancePlan["equipment"]
			return (
				<span className="flex items-center gap-1.5">
					<MapPinIcon className="text-muted-foreground size-4" />
					{equipments.location}
				</span>
			)
		},
	},
	{
		accessorKey: "_count",
		header: "Proximas Tareas (1 semana)",
		cell: ({ row }) => {
			const count = row.getValue("_count") as MaintenancePlan["_count"]
			return <span>{count.task} Tarea(s)</span>
		},
	},
	{
		accessorKey: "createdBy",
		header: "Creado por",
		cell: ({ row }) => {
			const createdBy = row.original.createdBy as MaintenancePlan["createdBy"]
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
