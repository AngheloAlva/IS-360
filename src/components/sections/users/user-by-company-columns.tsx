"use client"

import { ColumnDef } from "@tanstack/react-table"

import { USER_ROLE } from "@prisma/client"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"

import type { UsersByCompany } from "@/hooks/users/use-users-by-company"

export const UserByCompanyColumns: ColumnDef<UsersByCompany>[] = [
	{
		accessorKey: "role",
		header: "Rol",
		cell: ({ row }) => {
			const role = row.getValue("role") as USER_ROLE

			if (role !== USER_ROLE.SUPERVISOR && role !== USER_ROLE.PARTNER_COMPANY) return null

			return (
				<Badge
					className={cn({
						"border border-purple-500 bg-purple-500/10 text-purple-500":
							role === USER_ROLE.SUPERVISOR,
						"border border-teal-500 bg-teal-500/10 text-teal-500":
							role === USER_ROLE.PARTNER_COMPANY,
					})}
				>
					{role}
				</Badge>
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
