"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { USER_ROLE_LABELS } from "@/lib/permissions"
import { AreasLabels } from "@/lib/consts/areas"

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
	{
		accessorKey: "role",
		header: "Rol",
		cell: ({ row }) => {
			const roles = row.getValue("role") as string

			return (
				<div className="flex w-96 max-w-96 flex-wrap gap-1">
					{roles.split(",").map((role) => (
						<Badge key={role} className="border-green-500 bg-green-500/10 text-green-500">
							{USER_ROLE_LABELS[role]}
						</Badge>
					))}
				</div>
			)
		},
	},
	{
		accessorKey: "documentAreas",
		header: "Áreas de documentos",
		cell: ({ row }) => {
			const documentAreas = row.getValue("documentAreas") as string[]

			return (
				<div className="flex w-96 max-w-96 flex-wrap gap-1">
					{documentAreas.map((area) => (
						<Badge key={area} className="border-amber-500 bg-amber-500/10 text-amber-500">
							{AreasLabels[area as keyof typeof AreasLabels]}
						</Badge>
					))}
				</div>
			)
		},
	},
	{
		accessorKey: "createdAt",
		header: "Fecha de creación",
		cell: ({ row }) => {
			const date = row.getValue("createdAt")
			const formattedDate = format(date as Date, "dd/MM/yyyy")
			return <div>{formattedDate}</div>
		},
	},
]
