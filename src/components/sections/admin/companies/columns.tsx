"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { format } from "date-fns"

import type { Company, User } from "@prisma/client"

export const columns: ColumnDef<Company>[] = [
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
		header: "Supervisor",
		cell: ({ row }) => {
			const users = row.getValue("users") as User[]
			return <div>{users[0]?.name ?? "No Asignado"}</div>
		},
	},
]
