"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Edit } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

import { InternalRoleOptions } from "@/lib/consts/internal-roles"
import { UserRoleOptions } from "@/lib/consts/user-roles"
import { AreasLabels } from "@/lib/consts/areas"
import { USER_ROLE } from "@prisma/client"

import { Badge } from "@/components/ui/badge"

import type { UserWithRole } from "better-auth/plugins"

export const UserColumns: ColumnDef<UserWithRole>[] = [
	{
		accessorKey: "isSupervisor",
		header: "Empresa",
		cell: ({ row }) => {
			const role = row.getValue("role") as string
			const isSupervisor = row.getValue("isSupervisor") as boolean

			if (role !== "PARTNER_COMPANY") {
				return <div>OTC {isSupervisor && "- Supervisor"}</div>
			}

			const company = row.getValue("company") as string
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
		cell: ({ row }) => {
			const role = row.getValue("role") as string
			const roleLabel = UserRoleOptions.find((r) => r.value === role)?.label || role
			return <Badge variant={role === "PARTNER_COMPANY" ? "outline" : "default"}>{roleLabel}</Badge>
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

			return <Badge variant="outline">{AreasLabels[area]}</Badge>
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
		accessorKey: "id",
		header: "",
		cell: ({ row }) => {
			const id = row.getValue("id")
			const role = row.getValue("role")

			const isPartnerCompany = role === USER_ROLE.PARTNER_COMPANY || role === USER_ROLE.OPERATOR

			return (
				<Link
					href={`/admin/dashboard/usuarios/${isPartnerCompany ? "externos" : "internos"}/${id}`}
					className="text-primary hover:text-feature text-right font-medium hover:underline"
				>
					<Edit className="h-4 w-4" />
				</Link>
			)
		},
	},
]
