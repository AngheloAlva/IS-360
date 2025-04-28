"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Edit } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

import { USER_ROLES_VALUES, UserRolesLabels } from "@/lib/consts/user-roles"
import { InternalRoleOptions } from "@/lib/consts/internal-roles"
import { AreasLabels } from "@/lib/consts/areas"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"

import type { ApiUser } from "@/types/user"
import { USER_ROLE } from "@prisma/client"

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
		accessorKey: "role",
		header: "Rol",
		cell: ({ row }) => {
			const role = row.getValue("role") as USER_ROLE
			return (
				<Badge
					className={cn("border-green-500 bg-green-500/10 text-green-500", {
						"border-purple-500 text-purple-500 bg-purple-500/10": role === USER_ROLE.ADMIN,
					})}
				>
					{UserRolesLabels[role]}
				</Badge>
			)
		},
	},
	{
		accessorKey: "internalRole",
		header: "Rol Interno",
		cell: ({ row }) => {
			const role = row.getValue("role") as string
			if (role === "PARTNER_COMPANY") return null

			const internalRole = row.getValue("internalRole") as string
			const roleLabel =
				InternalRoleOptions.find((r) => r.value === internalRole)?.label || internalRole
			return roleLabel === "Ninguno" ? null : <Badge variant="secondary">{roleLabel}</Badge>
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
			const id = row.getValue("id")
			const role = row.getValue("role")

			const isPartnerCompany =
				role === USER_ROLES_VALUES.PARTNER_COMPANY || role === USER_ROLES_VALUES.OPERATOR

			if (isPartnerCompany) return null

			return (
				<Link
					href={`/admin/dashboard/usuarios/internos/editar/${id}`}
					className="text-primary hover:text-feature text-right font-medium hover:underline"
				>
					<Edit className="h-4 w-4" />
				</Link>
			)
		},
	},
]
