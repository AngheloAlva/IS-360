"use client"

import { ArrowUpDown, ChevronRight } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"

import { Company } from "@/hooks/companies/use-companies"

export const CompanyColumns: ColumnDef<Company>[] = [
	{
		accessorKey: "name",
		header: "Nombre",
		cell: ({ row }) => {
			const name = row.getValue("name") as string
			return <div className="font-semibold">{name}</div>
		},
	},
	{
		accessorKey: "rut",
		header: "RUT",
	},
	{
		accessorKey: "users",
		header: "Supervisores",
		cell: ({ row }) => {
			const users = row.getValue("users") as Company["users"]
			return (
				<ul className="flex flex-col">
					{users ? users.map((user) => <li key={user.id}>{user.name}</li>) : "No Asignado"}
				</ul>
			)
		},
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
		accessorKey: "actions",
		header: "Acciones",
		cell: ({ row }) => {
			const id = row.original.id

			return (
				<Link
					href={`/admin/dashboard/empresas/${id}`}
					className="flex items-center border-transparent bg-transparent tracking-wider text-green-500 shadow-none hover:underline"
				>
					Ver más
					<ChevronRight className="mt-0.5 h-4 w-4" />
				</Link>
			)
		},
	},
]
