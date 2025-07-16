import { ColumnDef } from "@tanstack/react-table"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import { WORK_ENTRY_TYPE } from "@/lib/consts/work-entry-type"
import { cn } from "@/lib/utils"

import { Badge } from "@/shared/components/ui/badge"

import type { WorkEntry } from "@/project/work-order/hooks/use-work-entries"
import type { ENTRY_TYPE } from "@prisma/client"

export const WorkEntryColumns: ColumnDef<WorkEntry>[] = [
	{
		accessorKey: "entryType",
		header: "Tipo de entrada",
		cell: ({ row }) => {
			const entryType = row.getValue("entryType") as ENTRY_TYPE
			return (
				<Badge
					className={cn("bg-orange-600/10 text-orange-600", {
						"bg-amber-600/10 text-amber-600": entryType === "ADDITIONAL_ACTIVITY",
						"bg-red-500/10 text-red-500": entryType === "OTC_INSPECTION",
						"bg-lime-500/10 text-lime-500": entryType === "COMMENT",
					})}
				>
					{WORK_ENTRY_TYPE[entryType]}
				</Badge>
			)
		},
	},
	{
		accessorKey: "milestone",
		header: "Nombre del hito",
		cell: ({ row }) => {
			const milestone = row.original.milestone?.name

			return <span>{milestone}</span>
		},
	},
	{
		accessorKey: "activityName",
		header: "Nombre de la actividad",
		cell: ({ row }) => {
			const activityName = row.getValue("activityName") as string

			return activityName || "Sin título"
		},
	},
	{
		accessorKey: "comments",
		header: "Descripción / Inspecciones",
		cell: ({ row }) => {
			const description = row.getValue("comments") as string
			const entryType = row.getValue("entryType") as ENTRY_TYPE
			const nonConformities = row.original.nonConformities
			const supervisionComments = row.original.supervisionComments
			const safetyObservations = row.original.safetyObservations

			if (entryType === "OTC_INSPECTION") {
				return (
					<p className="max-w-64 truncate">
						{nonConformities || supervisionComments || safetyObservations}
					</p>
				)
			}

			return <p className="max-w-64 truncate">{description}</p>
		},
	},
	{
		accessorKey: "executionDate",
		header: "Fecha de ejecución",
		cell: ({ row }) => {
			const date = row.getValue("executionDate") as Date
			return format(date, "PP", { locale: es })
		},
	},
	{
		accessorKey: "activityStartTime",
		header: "Hora de inicio",
	},
	{
		accessorKey: "activityEndTime",
		header: "Hora de fin",
	},
	{
		id: "createdBy",
		header: "Creado por",
		accessorFn: (row) => row.createdBy.name,
	},
]
