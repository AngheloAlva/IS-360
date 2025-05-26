"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { USER_ROLE_LABELS } from "@/lib/permissions"
import { AreasLabels } from "@/lib/consts/areas"
import { USER_ROLE } from "@prisma/client"

import InternalUserFormSheet from "@/components/forms/admin/user/InternalUserFormSheet"
import { Badge } from "@/components/ui/badge"

import type { ApiUser } from "@/types/user"

export const UserColumns: ColumnDef<ApiUser>[] = [
	{
		accessorKey: "isSupervisor",
		header: "Empresa",
		cell: ({ row }) => {
			const role = row.getValue("role") as string
			const isSupervisor = row.getValue("isSupervisor") as boolean

			if (role !== USER_ROLE.SUPERVISOR && role !== USER_ROLE.PARTNER_COMPANY) {
				return <div>OTC</div>
			}

			const company = row.original.company?.name
			return (
				<div>
					{company} {isSupervisor && "- Supervisor"}
				</div>
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
				<div className="flex max-w-96 flex-wrap gap-1">
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
		accessorKey: "createdAt",
		header: "Fecha de creación",
		cell: ({ row }) => {
			const date = row.getValue("createdAt")
			const formattedDate = format(date as Date, "dd/MM/yyyy")
			return <div>{formattedDate}</div>
		},
	},
	{
		accessorKey: "id",
		header: "",
		cell: ({ row }) => {
			return <InternalUserFormSheet initialData={row.original} />
		},
	},
]
