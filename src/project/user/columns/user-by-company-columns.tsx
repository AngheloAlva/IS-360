"use client"

import { getImageProps } from "next/image"

import UpdateExternalUserForm from "@/project/user/components/forms/UpdateExternalUserForm"
import DeleteExternalUserDialog from "@/project/user/components/forms/DeleteExternalUser"
import ReactivateExternalUserDialog from "../components/forms/ReactivateExternalUser"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu"
import ActionDataMenu from "@/shared/components/ActionDataMenu"
import { Badge } from "@/shared/components/ui/badge"

import type { UsersByCompany } from "@/project/user/hooks/use-users-by-company"
import type { ColumnDef, Row } from "@tanstack/react-table"

export const getUserByCompanyColumns = ({
	showAll,
	showReactivate,
}: {
	showAll?: boolean
	showReactivate?: boolean
}): ColumnDef<UsersByCompany>[] => [
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

						{user.isActive ? (
							<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
								<DeleteExternalUserDialog userId={user.id} companyId={user.companyId} />
							</DropdownMenuItem>
						) : showReactivate ? (
							<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
								<ReactivateExternalUserDialog userId={user.id} companyId={user.companyId} />
							</DropdownMenuItem>
						) : null}
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

			const { props } = getImageProps({
				alt: name,
				width: 32,
				height: 32,
				src: image || "",
			})

			return (
				<Avatar className="size-8 text-sm">
					<AvatarImage {...props} />
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
	...(showAll
		? [
				{
					accessorKey: "isActive",
					header: "Activo",
					cell: ({ row }: { row: Row<UsersByCompany> }) => {
						const isActive = row.getValue("isActive") as boolean

						return (
							<Badge variant={isActive ? "default" : "destructive"}>{isActive ? "Sí" : "No"}</Badge>
						)
					},
				},
			]
		: []),
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
