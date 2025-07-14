"use client"

import { ArrowRightIcon, EyeIcon } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { StartupFolderStatus } from "@prisma/client"
import { generateSlug } from "@/lib/generateSlug"

import CompanyDetailsDialog from "@/project/company/components/dialogs/CompanyDetailsDialog"
import DeleteCompanyDialog from "@/project/company/components/forms/DeleteCompanyDialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu"
import ActionDataMenu from "@/shared/components/ActionDataMenu"

import type { Company } from "@/project/company/hooks/use-companies"

export const CompanyColumns: ColumnDef<Company>[] = [
	{
		accessorKey: "actions",
		header: "",
		cell: ({ row }) => {
			const id = row.original.id

			return (
				<ActionDataMenu>
					<>
						<DropdownMenuItem asChild>
							<Link
								href={`/admin/dashboard/empresas/${id}`}
								className="text-text z-10 flex cursor-pointer px-3 font-medium"
							>
								<EyeIcon className="size-4" /> Ver detalles
							</Link>
						</DropdownMenuItem>

						<DropdownMenuItem onClick={(e) => e.preventDefault()}>
							<DeleteCompanyDialog companyId={id} />
						</DropdownMenuItem>
					</>
				</ActionDataMenu>
			)
		},
	},
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
		header: "Nombre Empresa",
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
		header: "RUT Empresa",
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
		accessorKey: "startupFolders",
		header: "Carpetas de arranque",
		cell: ({ row }) => {
			const startupFolders = row.original.StartupFolders
			const startupFoldersCompleted = startupFolders.filter(
				(folder) => folder.status === StartupFolderStatus.COMPLETED
			).length

			return (
				<div className="flex items-center gap-2">
					<span className="text-sm">
						{startupFolders.length} Carpeta{startupFolders.length > 1 ? "s" : ""} /{" "}
						{startupFoldersCompleted} Completada{startupFoldersCompleted > 1 ? "s" : ""}
					</span>

					<Link
						href={`/admin/dashboard/carpetas-de-arranques/${generateSlug(row.original.name)}_${row.original.id}`}
						className="roundedtracking-wider flex size-6 items-center justify-center rounded-full text-blue-600 transition-all hover:scale-105 hover:bg-blue-600 hover:text-white"
					>
						<ArrowRightIcon className="size-4" />
					</Link>
				</div>
			)
		},
	},
]
