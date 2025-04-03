import { ColumnDef } from "@tanstack/react-table"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import { WORK_ENTRY_TYPE } from "@/lib/consts/work-entry-type"

import { Badge } from "@/components/ui/badge"

import type { WorkEntry } from "@/hooks/use-work-entries"
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
					className={cn("border-primary text-primary bg-white", {
						"border-cyan-500 text-cyan-500": entryType === "ADDITIONAL_ACTIVITY",
						"border-purple-500 text-purple-500": entryType === "OTC_INSPECTION",
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
	},
	{
		accessorKey: "comments",
		header: "Descripción",
		cell: ({ row }) => {
			const description = row.getValue("comments") as string
			return <span className="line-clamp-2">{description}</span>
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
