"use client"

import { ArrowUpDown, ChevronRight } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"

import { Company } from "@/hooks/companies/use-companies"

import { Button } from "@/components/ui/button"

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
				// <Link href={`/admin/dashboard/empresas/${id}/supervisores/agregar`}>
				// 	<Button
				// 		size={"sm"}
				// 		variant={"outline"}
				// 		className="border-green-500 bg-green-600 tracking-wider text-white hover:bg-green-800"
				// 	>
				// 		<Plus className="mr-2 h-4 w-4" /> Supervisor(es)
				// 	</Button>
				// </Link>
				<Link href={`/admin/dashboard/empresas/${id}`}>
					<Button
						size={"sm"}
						variant={"outline"}
						className="border-green-500 bg-green-600 tracking-wider text-white hover:text-white hover:bg-green-800"
					>
						Ver más
						<ChevronRight className="mt-0.5 h-4 w-4" />
					</Button>
				</Link>
			)
		},
	},
]
