"use client"

import UpdateExternalUserForm from "@/project/user/components/forms/UpdateExternalUserForm"
import DeleteExternalUserDialog from "@/project/user/components/forms/DeleteExternalUser"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu"
import ActionDataMenu from "@/shared/components/ActionDataMenu"

import type { UsersByCompany } from "@/project/user/hooks/use-users-by-company"
import type { ColumnDef } from "@tanstack/react-table"

export const UserByCompanyColumns: ColumnDef<UsersByCompany>[] = [
	{
		id: "actions",
		header: "",
		cell: ({ row }) => {
			const user = row.original

			return (
				<ActionDataMenu>
					<>
						<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
							<UpdateExternalUserForm user={user} />
						</DropdownMenuItem>

						<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
							<DeleteExternalUserDialog userId={user.id} companyId={user.companyId} />
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
]
