"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"

import type { MaintenancePlan } from "@/hooks/maintenance-plans/use-maintenance-plans"

export const MaintenancePlanColumns: ColumnDef<MaintenancePlan>[] = [
	{
		accessorKey: "name",
		header: "Nombre",
		cell: ({ row }) => {
			const name = row.getValue("name") as string
			const slug = row.original.slug as string

			return (
				<Link
					href={`/admin/dashboard/planes-de-mantenimiento/${slug}/tareas`}
					className="text-primary hover:text-feature text-right font-medium hover:underline"
				>
					{name}
				</Link>
			)
		},
	},
	{
		accessorKey: "equipment",
		header: "Equipo",
		cell: ({ row }) => {
			const equipments = row.getValue("equipment") as MaintenancePlan["equipment"]
			return <span>{equipments.name}</span>
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
