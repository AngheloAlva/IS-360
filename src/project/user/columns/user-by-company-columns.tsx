"use client"

import { MoreHorizontal } from "lucide-react"

import UpdateExternalUserForm from "@/project/user/components/forms/UpdateExternalUserForm"
import DeleteExternalUserDialog from "@/project/user/components/forms/DeleteExternalUser"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Button } from "@/shared/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu"

import type { UsersByCompany } from "@/project/user/hooks/use-users-by-company"
import type { ColumnDef } from "@tanstack/react-table"

export const UserByCompanyColumns: ColumnDef<UsersByCompany>[] = [
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
	},
	{
		accessorKey: "internalArea",
		header: "Area",
	},
	{
		accessorKey: "isSupervisor",
		header: "Supervisor",
		cell: ({ row }) => {
			const isSupervisor = row.getValue("isSupervisor") as boolean

			return isSupervisor ? "Sí" : "No"
		},
	},
	{
		id: "actions",
		header: "Acciones",
		cell: ({ row }) => {
			const user = row.original

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Abrir menú</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Acciones</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
							<UpdateExternalUserForm user={user} />
						</DropdownMenuItem>

						<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
							<DeleteExternalUserDialog userId={user.id} companyId={user.companyId} />
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)
		},
	},
]
