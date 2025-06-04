"use client"

import { ArrowUpDown, ChevronRight } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import type { Company } from "@/hooks/companies/use-companies"

export const CompanyColumns: ColumnDef<Company>[] = [
	{
		accessorKey: "image",
		cell: ({ row }) => {
			const image = row.getValue("image") as string
			const name = row.getValue("name") as string

			return (
				<Avatar className="size-10 text-sm">
					<AvatarImage src={image} alt={name} />
					<AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
				</Avatar>
			)
		},
	},
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

			if (!users || users.length === 0) return <span>No Asignado</span>

			const firstTwoUsers = users.slice(0, 2)
			const remainingCount = users.length - 2

			return (
				<ul className="flex flex-col gap-0.5">
					{firstTwoUsers.map((user) => (
						<li key={user.id} className="text-sm">
							{user.name}
						</li>
					))}
					{remainingCount > 0 && (
						<li className="text-muted-foreground text-sm">
							+{remainingCount} supervisor{remainingCount > 1 ? "es" : ""}
						</li>
					)}
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
					className="text-primary flex items-center border-transparent bg-transparent tracking-wider shadow-none hover:underline"
				>
					Ver más
					<ChevronRight className="mt-0.5 h-4 w-4" />
				</Link>
			)
		},
	},
]
