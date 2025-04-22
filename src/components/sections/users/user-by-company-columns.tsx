"use client"

import { ColumnDef } from "@tanstack/react-table"

import type { UsersByCompany } from "@/hooks/users/use-users-by-company"

export const UserByCompanyColumns: ColumnDef<UsersByCompany>[] = [
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
