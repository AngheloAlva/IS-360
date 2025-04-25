"use client"

import { TaskFrequencyLabels } from "@/lib/consts/task-frequency"
import { differenceInDays, format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"

import type { MaintenancePlanTask } from "@/hooks/maintenance-plans/use-maintenance-plans-tasks"

export const MaintenancePlanTaskColumns: ColumnDef<MaintenancePlanTask>[] = [
	{
		accessorKey: "responsible",
		header: "Responsable",
		cell: ({ row }) => {
			const responsible = row.original.responsible as MaintenancePlanTask['responsible']
			return <span>{responsible.name}</span>
		},
	},
	{
		accessorKey: "company",
		header: "Empresa",
		cell: ({ row }) => {
			const company = row.original.company as MaintenancePlanTask['company']
			const isInternal = row.original.isInternalResponsible as MaintenancePlanTask['isInternalResponsible']
			return <span>{isInternal ? "OTC" : company.name}</span>
		},
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
			return <p className="max-w-64 w-64 text-wrap">{description}</p>
		},
	},
	{
		accessorKey: "frequency",
		header: "Frecuencia",
		cell: ({ row }) => {
			const frequency = row.getValue("frequency") as MaintenancePlanTask['frequency']
			return <Badge className="bg-primary/10 border-primary text-primary">{TaskFrequencyLabels[frequency]}</Badge>
		},
	},
	{
		accessorKey: "nextDate",
		header: "Proxima Ejecución",
		cell: ({ row }) => {
			const nextDate = row.getValue("nextDate") as Date
			const leftDays = differenceInDays(new Date(nextDate), new Date())

			return <Badge className={cn({
				"bg-green-500/10 border-green-500 text-green-500": leftDays > 0,
				"bg-amber-500/10 border-amber-500 text-amber-500": leftDays <= 15,
				"bg-red-500/10 border-red-500 text-red-500": leftDays <= 0
			})}>{format(new Date(nextDate), "dd-MM-yyyy")}</Badge>
		},
	},
	{
		accessorKey: "equipment",
		header: "Equipo",
		cell: ({ row }) => {
			const equipment = row.original.equipment as MaintenancePlanTask['equipment']
			return <span>{equipment.name}</span>
		},
	},
	{
		accessorKey: 'attachments',
		header: "Adjuntos",
		cell: ({ row }) => {
			const attachments = row.original.attachments as MaintenancePlanTask['attachments']
			return <ul className="flex flex-col gap-1">
				{attachments.map((attachment) => (
					<li key={attachment.id}>
						<Link href={attachment.url} target="_blank" rel="noopener noreferrer" className="underline text-primary">
							{attachment.name}
						</Link>
					</li>
				))}
			</ul>
		}
	},
	{
		accessorKey: "createdBy",
		header: "Creado por",
		cell: ({ row }) => {
			const createdBy = row.original.createdBy as MaintenancePlanTask['createdBy']
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
