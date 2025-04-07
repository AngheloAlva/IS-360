"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import { Company } from "@/hooks/use-companies"

export const CompanyColumns: ColumnDef<Company>[] = [
	{
		accessorKey: "name",
		header: "Nombre",
	},
	{
		accessorKey: "rut",
		header: "RUT",
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => {
			return (
				<div
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="hover:text-primary flex cursor-pointer items-center transition-colors"
				>
					Fecha de creación
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</div>
			)
		},
		cell: ({ row }) => {
			const date = row.getValue("createdAt")
			const formattedDate = format(date as Date, "dd/MM/yyyy")
			return <div>{formattedDate}</div>
		},
	},
	{
		accessorKey: "users",
		header: "Supervisores",
		cell: ({ row }) => {
			const users = row.getValue("users") as Company["users"]
			return <div>{users ? users.map((user) => user.name).join(", ") : "No Asignado"}</div>
		},
	},
]
