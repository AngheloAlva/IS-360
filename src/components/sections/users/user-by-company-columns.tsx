"use client"

import { ColumnDef } from "@tanstack/react-table"

import type { UsersByCompany } from "@/hooks/users/use-users-by-company"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const UserByCompanyColumns: ColumnDef<UsersByCompany>[] = [
	{
		accessorKey: "image",
		cell: ({ row }) => {
			const image = row.getValue("image") as string
			const name = row.getValue("name") as string

			return (
				<Avatar className="size-8 text-sm">
					<AvatarImage src={image} alt={name} />
					<AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
				</Avatar>
			)
		},
	},
	{
		accessorKey: "name",
		header: "Nombre",
	},
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "phone",
		header: "Teléfono",
	},
	{
		accessorKey: "rut",
		header: "RUT",
	},
	{
		accessorKey: "internalRole",
		header: "Cargo",
	},
	{
		accessorKey: "internalArea",
		header: "Area",
	},
	// {
	// 	accessorKey: "id",
	// 	header: "",
	// 	cell: ({ row }) => {
	// 		const id = row.getValue("id")

	// 		return (
	// 			<Link
	// 				href={`/admin/dashboard/usuarios/internos/editar/${id}`}
	// 				className="text-primary hover:text-feature text-right font-medium hover:underline"
	// 			>
	// 				<Edit className="h-4 w-4" />
	// 			</Link>
	// 		)
	// 	},
	// },
]
