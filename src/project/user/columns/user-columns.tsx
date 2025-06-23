"use client"

import { ColumnDef } from "@tanstack/react-table"

import { AreasLabels } from "@/lib/consts/areas"

import UserDetailsDialog from "@/project/user/components/dialogs/UserDetailsDialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Badge } from "@/shared/components/ui/badge"

import type { ApiUser } from "@/project/user/types/api-user"

export const UserColumns: ColumnDef<ApiUser>[] = [
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
		cell: ({ row }) => {
			const user = row.original
			return (
				<UserDetailsDialog user={user}>
					<button className="text-left font-semibold text-purple-500 transition-colors hover:underline">
						{user.name}
					</button>
				</UserDetailsDialog>
			)
		},
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
		cell: ({ row }) => {
			const internalRole = row.getValue("internalRole") as string

			if (!internalRole) return null

			return <Badge variant="secondary">{internalRole}</Badge>
		},
	},
	{
		accessorKey: "area",
		header: "Área",
		cell: ({ row }) => {
			const role = row.getValue("role") as string
			if (role === "PARTNER_COMPANY") return null

			const area = row.getValue("area") as keyof typeof AreasLabels
			if (!area) return null

			return (
				<Badge variant="outline" className="bg-primary/10">
					{AreasLabels[area]}
				</Badge>
			)
		},
	},
]
