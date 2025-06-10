import { ColumnDef } from "@tanstack/react-table"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import { WORK_ENTRY_TYPE } from "@/lib/consts/work-entry-type"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"

import type { WorkEntry } from "@/hooks/work-orders/use-work-entries"
import type { ENTRY_TYPE } from "@prisma/client"

export const WorkEntryColumns: ColumnDef<WorkEntry>[] = [
	{
		accessorKey: "entryType",
		header: "Tipo de entrada",
		cell: ({ row }) => {
			const entryType = row.getValue("entryType") as ENTRY_TYPE
			return (
				<Badge
					className={cn("border-orange-600 bg-orange-600/10 text-orange-600", {
						"border-amber-600 bg-amber-600/10 text-amber-600": entryType === "ADDITIONAL_ACTIVITY",
						"border-red-500 bg-red-500/10 text-red-500": entryType === "OTC_INSPECTION",
						"border-lime-500 bg-lime-500/10 text-lime-500": entryType === "COMMENT",
					})}
				>
					{WORK_ENTRY_TYPE[entryType]}
				</Badge>
			)
		},
	},
	{
		accessorKey: "activityName",
		header: "Título",
		cell: ({ row }) => {
			const activityName = row.getValue("activityName") as string
			const entryType = row.getValue("entryType") as ENTRY_TYPE
			const nonConformities = row.original.nonConformities

			if (!activityName && entryType === "OTC_INSPECTION" && nonConformities) {
				return <span className="line-clamp-2">{nonConformities}</span>
			}

			return activityName || "Sin título"
		},
	},
	{
		accessorKey: "comments",
		header: "Descripción",
		cell: ({ row }) => {
			const description = row.getValue("comments") as string
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
		header: "Fecha de inicio",
	},
	{
		accessorKey: "activityEndTime",
		header: "Fecha de fin",
	},
	{
		id: "createdBy",
		header: "Creado por",
		accessorFn: (row) => row.createdBy.name,
	},
]
