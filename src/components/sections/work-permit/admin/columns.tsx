import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import type { WorkPermitTableItem } from "./types"

export const columns: ColumnDef<WorkPermitTableItem>[] = [
	{
		accessorKey: "id",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					ID
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
	},
	{
		accessorKey: "otNumber",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Número OT
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
	},
	{
		accessorKey: "company",
		header: "Empresa",
		cell: ({ row }) => (
			<div className="flex max-w-[200px] items-center">
				<span className="truncate font-medium">{row.getValue("company")}</span>
			</div>
		),
	},
	{
		accessorKey: "area",
		header: "Área",
		cell: ({ row }) => (
			<div className="flex max-w-[200px] items-center">
				<span className="truncate">{row.getValue("area")}</span>
			</div>
		),
	},
	{
		accessorKey: "type",
		header: "Tipo",
	},
	{
		accessorKey: "status",
		header: "Estado",
		cell: ({ row }) => {
			const status = row.getValue("status") as string

			return (
				<Badge
					variant={
						status === "Completado"
							? "outline"
							: status === "En Progreso"
								? "default"
								: "destructive"
					}
				>
					{status}
				</Badge>
			)
		},
	},
	{
		accessorKey: "date",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Fecha
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
	},
]
