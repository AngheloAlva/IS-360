"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { ArrowUpDown } from "lucide-react"

import type { UserWithRole } from "better-auth/plugins"

export const columns: ColumnDef<UserWithRole>[] = [
	// {
	// 	accessorKey: "id",
	// 	header: "",
	// 	cell: ({ row }) => {
	// 		const id = row.getValue("id")
	// 		return (
	// 			<Link
	// 				href={`/dashboard/libro-de-obras/${id}`}
	// 				className="text-primary hover:text-feature text-right font-medium hover:underline"
	// 			>
	// 				<LinkIcon className="h-4 w-4" />
	// 			</Link>
	// 		)
	// 	},
	// },
	{
		accessorKey: "name",
		header: "Nombre",
	},
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "rut",
		header: "RUT",
	},
	{
		accessorKey: "role",
		header: ({ column }) => {
			return (
				<div
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="hover:text-primary flex cursor-pointer items-center transition-colors"
				>
					Rol
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</div>
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
]
