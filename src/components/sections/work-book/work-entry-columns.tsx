import { ColumnDef } from "@tanstack/react-table"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import { WORK_ENTRY_TYPE } from "@/lib/consts/work-entry-type"

import { Badge } from "@/components/ui/badge"

import type { WorkEntry } from "@/hooks/work-orders/use-work-entries"
import type { ENTRY_TYPE } from "@prisma/client"
import { cn } from "@/lib/utils"

export const WorkEntryColumns: ColumnDef<WorkEntry>[] = [
	{
		accessorKey: "entryType",
		header: "Tipo de entrada",
		cell: ({ row }) => {
			const entryType = row.getValue("entryType") as ENTRY_TYPE
			return (
				<Badge
					className={cn("border-primary text-primary bg-primary/10", {
						"border-cyan-500 bg-cyan-500/10 text-cyan-500": entryType === "ADDITIONAL_ACTIVITY",
						"border-purple-500 bg-purple-500/10 text-purple-500": entryType === "OTC_INSPECTION",
						"border-amber-500 bg-amber-500/10 text-amber-500": entryType === "COMMENT",
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
	{
		accessorKey: "createdAt",
		header: "Fecha de creación",
		cell: ({ row }) => {
			const date = row.getValue("createdAt") as string
			return format(new Date(date), "PPp", { locale: es })
		},
	},
]
