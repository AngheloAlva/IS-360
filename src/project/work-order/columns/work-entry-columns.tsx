import { CalendarIcon, KanbanSquareIcon, UserIcon } from "lucide-react"
import { type ColumnDef, type Row, type Table } from "@tanstack/react-table"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import { WORK_ENTRY_TYPE } from "@/lib/consts/work-entry-type"
import {
	getInspectionDisplayStatus,
	INSPECTION_STATUS_LABELS,
	INSPECTION_STATUS_COLORS,
} from "@/lib/utils/inspection-status"
import { cn } from "@/lib/utils"

import { Checkbox } from "@/shared/components/ui/checkbox"
import { Badge } from "@/shared/components/ui/badge"

import type { WorkEntry } from "@/project/work-order/hooks/use-work-entries"
import type { ENTRY_TYPE } from "@/generated/prisma/enums"

interface GetWorkEntryColumnsProps {
	isInternalMember: boolean
}

export function getWorkEntryColumns({
	isInternalMember,
}: GetWorkEntryColumnsProps): ColumnDef<WorkEntry>[] {
	return [
		...(isInternalMember
			? [
					{
						id: "select",
						size: 25,
						header: ({ table }: { table: Table<WorkEntry> }) => (
							<div onClick={(e) => e.stopPropagation()}>
								<Checkbox
									checked={
										table.getIsAllPageRowsSelected() ||
										(table.getIsSomePageRowsSelected() && "indeterminate")
									}
									onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
									aria-label="Select all"
									className="mr-1 data-[state=checked]:bg-teal-500"
								/>
							</div>
						),
						cell: ({ row }: { row: Row<WorkEntry> }) => (
							<div onClick={(e) => e.stopPropagation()}>
								<Checkbox
									checked={row.getIsSelected()}
									onCheckedChange={(value) => row.toggleSelected(!!value)}
									aria-label="Select row"
									className="data-[state=checked]:bg-teal-500"
								/>
							</div>
						),
						enableSorting: false,
						enableHiding: false,
					},
				]
			: []),
		{
			accessorKey: "entryType",
			header: "Tipo de entrada",
			size: 100,
			cell: ({ row }) => {
				const entryType = row.getValue("entryType") as ENTRY_TYPE
				return (
					<Badge
						className={cn("bg-orange-600/10 text-orange-600", {
							"bg-amber-600/10 text-amber-600": entryType === "ADDITIONAL_ACTIVITY",
							"bg-red-500/10 text-red-500": entryType === "INTERNAL_INSPECTION",
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

				return (
					<span className="flex items-center gap-1.5">
						<KanbanSquareIcon className="text-muted-foreground size-3.5 min-w-3.5" />
						{milestone}
					</span>
				)
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

				if (entryType === "INTERNAL_INSPECTION") {
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
				return (
					<span className="flex items-center gap-1.5">
						<CalendarIcon className="text-muted-foreground size-3.5" />
						{format(date, "PP", { locale: es })}
					</span>
				)
			},
		},
		{
			id: "createdBy",
			header: "Creado por",
			cell: ({ row }) => {
				const name = row.original.createdBy.name

				return (
					<span className="flex items-center gap-1.5">
						<UserIcon className="text-muted-foreground size-3.5" />
						{name}
					</span>
				)
			},
		},
		{
			accessorKey: "inspectionStatus",
			header: "Estado de Inspección",
			cell: ({ row }) => {
				const entryType = row.getValue("entryType") as ENTRY_TYPE
				const inspectionStatus = row.original.inspectionStatus
				const inspectionComments = row.original.inspectionComments

				if (entryType !== "INTERNAL_INSPECTION" || !inspectionStatus) {
					return <span className="text-gray-400">-</span>
				}

				const displayStatus = getInspectionDisplayStatus(inspectionStatus, inspectionComments)
				const statusConfig = INSPECTION_STATUS_COLORS[displayStatus]

				return (
					<Badge className={cn("text-xs", statusConfig.badge)} variant="outline">
						{INSPECTION_STATUS_LABELS[displayStatus]}
					</Badge>
				)
			},
		},
	]
}
