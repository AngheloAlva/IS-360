"use client"

import { ColumnDef } from "@tanstack/react-table"
import { EyeIcon } from "lucide-react"
import Link from "next/link"

import CompanyDetailsDialog from "@/project/company/components/dialogs/CompanyDetailsDialog"
import DeleteCompanyDialog from "@/project/company/components/forms/DeleteCompanyDialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"

import type { Company } from "@/project/company/hooks/use-companies"

export const CompanyColumns: ColumnDef<Company>[] = [
	{
		accessorKey: "image",
		cell: ({ row }) => {
			const image = row.getValue("image") as string
			const name = row.getValue("name") as string

			return (
				<Avatar className="size-10 text-sm">
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
			const company = row.original
			return (
				<CompanyDetailsDialog company={company}>
					<button className="flex cursor-pointer items-center gap-1 text-left font-semibold text-blue-500 hover:underline">
						{company.name}
					</button>
				</CompanyDetailsDialog>
			)
		},
	},
	{
		accessorKey: "rut",
		header: "RUT",
	},
	{
		accessorKey: "users",
		header: "Supervisores",
		cell: ({ row }) => {
			const users = row.getValue("users") as Company["users"]

			if (!users || users.length === 0) return <span>No Asignado</span>

			const firstTwoUsers = users.slice(0, 2)
			const remainingCount = users.length - 2

			return (
				<ul className="flex flex-col gap-0.5">
					{firstTwoUsers.map((user) => (
						<li key={user.id} className="text-sm">
							{user.name}
						</li>
					))}
					{remainingCount > 0 && (
						<li className="text-muted-foreground text-sm">
							+{remainingCount} supervisor{remainingCount > 1 ? "es" : ""}
						</li>
					)}
				</ul>
			)
		},
	},
	{
		accessorKey: "actions",
		header: "Acciones",
		cell: ({ row }) => {
			const id = row.original.id

			return (
				<div className="flex items-center gap-2">
					<Link
						href={`/admin/dashboard/empresas/${id}`}
						className="flex size-8 items-center justify-center rounded-lg bg-blue-600 tracking-wider text-white transition-all hover:scale-105 hover:bg-blue-700"
					>
						<EyeIcon className="size-4" />
					</Link>

					<DeleteCompanyDialog companyId={id} />
				</div>
			)
		},
	},
]
