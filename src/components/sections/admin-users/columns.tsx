"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Edit } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

import { InternalRoleOptions } from "@/lib/consts/internal-roles"
import { UserRoleOptions } from "@/lib/consts/user-roles"
import { USER_ROLE } from "@prisma/client"

import { Badge } from "@/components/ui/badge"

import type { UserWithRole } from "better-auth/plugins"

export const columns: ColumnDef<UserWithRole>[] = [
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
		accessorKey: "isSupervisor",
		header: "Supervisor Externo",
		cell: ({ row }) => {
			const isSupervisor = row.getValue("isSupervisor")

			return isSupervisor && <Badge variant="secondary">Sí</Badge>
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

			const area = row.getValue("area") as string
			if (!area) return null

			const areaLabels: Record<string, string> = {
				OPERATIONS: "Operaciones",
				INSTRUCTIONS: "Instructivos",
				INTEGRITY_AND_MAINTENANCE: "Integridad y Mantención",
				ENVIRONMENT: "Medio Ambiente",
				RISK_PREVENTION: "Prevención de Riesgos",
				QUALITY_AND_PROFESSIONAL_EXCELLENCE: "Calidad y Excelencia Profesional",
				HSEQ: "HSEQ",
				LEGAL: "Jurídica",
				COMMUNITIES: "Comunidades",
			}

			return <Badge variant="outline">{areaLabels[area] || area}</Badge>
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
					href={`/dashboard/admin/usuarios/${isPartnerCompany ? "externos" : "internos"}/${id}`}
					className="text-primary hover:text-feature text-right font-medium hover:underline"
				>
					<Edit className="h-4 w-4" />
				</Link>
			)
		},
	},
]
