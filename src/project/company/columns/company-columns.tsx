"use client"

import { ArrowRightIcon, EyeIcon } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { getImageProps } from "next/image"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import { StartupFolderStatus } from "@/generated/prisma/enums"
import { generateSlug } from "@/lib/generateSlug"

import CompanyDetailsDialog from "@/project/company/components/dialogs/CompanyDetailsDialog"
import { DataGridColumnHeader } from "@/shared/components/data-grid/data-grid-column-header"
import DeleteCompanyDialog from "@/project/company/components/forms/DeleteCompanyDialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import ReactiveCompanyDialog from "../components/forms/ReactiveCompanyDialog"
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu"
import ActionDataMenu from "@/shared/components/ActionDataMenu"

import type { Company } from "@/project/company/hooks/use-companies"

export const CompanyColumns: ColumnDef<Company>[] = [
	{
		id: "actions",
		header: "",
		enableSorting: false,
		meta: {
			headerTitle: "Acciones",
		},
		size: 35,
		enableResizing: false,
		cell: ({ row }) => {
			const id = row.original.id
			const isActive = row.original.isActive

			return (
				<ActionDataMenu>
					<>
						<DropdownMenuItem asChild>
							<Link
								href={`/admin/dashboard/empresas/${id}`}
								className="text-text z-10 flex cursor-pointer px-3 font-semibold"
							>
								<EyeIcon className="size-4" /> Ver detalles
							</Link>
						</DropdownMenuItem>

						{isActive ? (
							<DropdownMenuItem onClick={(e) => e.preventDefault()}>
								<DeleteCompanyDialog companyId={id} />
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem onClick={(e) => e.preventDefault()}>
								<ReactiveCompanyDialog companyId={id} />
							</DropdownMenuItem>
						)}
					</>
				</ActionDataMenu>
			)
		},
	},
	{
		accessorKey: "image",
		header: "",
		enableSorting: false,
		meta: {
			headerTitle: "Logo",
		},

		size: 40,
		enableResizing: false,
		cell: ({ row }) => {
			const image = row.getValue("image") as string
			const name = row.getValue("name") as string

			const { props } = getImageProps({
				alt: name,
				width: 40,
				height: 40,
				src: image || "",
			})

			return (
				<Avatar className="size-10 text-sm">
					<AvatarImage {...props} />
					<AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
				</Avatar>
			)
		},
	},
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Nombre Empresa" visibility />
		),
		meta: {
			headerTitle: "Nombre Empresa",
		},
		cell: ({ row }) => {
			const company = row.original
			return (
				<CompanyDetailsDialog company={company}>
					<button className="flex cursor-pointer items-center gap-1 text-left font-semibold text-blue-500 hover:underline dark:text-blue-700">
						{company.name}
					</button>
				</CompanyDetailsDialog>
			)
		},
	},
	{
		accessorKey: "rut",
		header: ({ column }) => <DataGridColumnHeader column={column} title="RUT Empresa" visibility />,
		meta: {
			headerTitle: "RUT Empresa",
		},
	},
	{
		accessorKey: "users",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Supervisores" visibility />
		),
		enableSorting: false,
		meta: {
			headerTitle: "Supervisores",
		},
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
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Carpetas de arranque" visibility />
		),
		enableSorting: false,
		meta: {
			headerTitle: "Carpetas de arranque",
		},
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
						href={`/admin/dashboard/carpetas-de-arranque/${generateSlug(row.original.name)}_${row.original.id}`}
						className="roundedtracking-wider flex size-6 items-center justify-center rounded-full text-blue-600 transition-all hover:scale-105 hover:bg-blue-600 hover:text-white"
					>
						<ArrowRightIcon className="size-4" />
					</Link>
				</div>
			)
		},
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Fecha de creacion" visibility />
		),
		meta: {
			headerTitle: "Fecha de creacion",
		},
		cell: ({ row }) => {
			const createdAt = row.getValue("createdAt") as Date
			return format(createdAt, "dd/MM/yyyy", { locale: es })
		},
	},
]
