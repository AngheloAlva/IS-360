"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Plus } from "lucide-react"
import { format } from "date-fns"
import { Company } from "@/hooks/use-companies"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
		cell: ({ row }) => {
			const id = row.original.id

			return (
				<Link href={`/admin/dashboard/empresas/${id}/supervisores/agregar`}>
					<Button
						size={"sm"}
						variant={"outline"}
						className="border-feature text-feature hover:bg-feature bg-white hover:text-white"
					>
						<Plus className="mr-2 h-4 w-4" /> Supervisor(es)
					</Button>
				</Link>
			)
		},
	},
]
