import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { AdminWorkPermit } from "@/hooks/work-permit/use-admin-work-permits"
import { WorkPermitActions } from "./WorkPermitActions"

export const workPermitColumns: ColumnDef<AdminWorkPermit>[] = [
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
		accessorKey: "otNumber.otNumber",
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
		cell: ({ row }) => {
			const company = row.original.company

			return (
				<div className="flex max-w-[200px] items-center">
					<span className="truncate font-medium">{company.name}</span>
				</div>
			)
		},
	},
	{
		accessorKey: "exactPlace",
		header: "Área",
		cell: ({ row }) => (
			<div className="flex max-w-[200px] items-center">
				<span className="truncate">{row.getValue("exactPlace")}</span>
			</div>
		),
	},
	{
		accessorKey: "workWillBe",
		header: "Tipo",
	},
	{
		accessorKey: "status",
		header: "Estado",
		cell: ({ row }) => {
			const status = row.getValue("status") as string

			return <Badge variant={row.original.workCompleted ? "outline" : "default"}>{status}</Badge>
		},
	},
	{
		accessorKey: "createdAt",
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
	{
		id: "actions",
		cell: ({ row }) => <WorkPermitActions workPermit={row.original} />,
	},
]
