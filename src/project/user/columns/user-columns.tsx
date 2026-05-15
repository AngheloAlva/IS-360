"use client"

import { ColumnDef } from "@tanstack/react-table"
import { getImageProps } from "next/image"

import { ModulesLabels } from "@/lib/consts/modules"
import { AreasLabels } from "@/lib/consts/areas"

import { DataGridColumnHeader } from "@/shared/components/data-grid/data-grid-column-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import UserDetailsDialog from "@/project/user/components/dialogs/UserDetailsDialog"
import InternalUser from "@/project/user/components/forms/InternalUser"
import DeleteUser from "@/project/user/components/forms/DeleteUser"
import { Badge } from "@/shared/components/ui/badge"

import type { ApiUser } from "@/project/user/types/api-user"

export const getUserColumns = ({
	hasPermission,
}: {
	hasPermission: boolean
}): ColumnDef<ApiUser>[] => {
	const baseColumns: ColumnDef<ApiUser>[] = [
		{
			accessorKey: "image",
			header: "",
			enableSorting: false,
			meta: {
				headerTitle: "Avatar",
			},
			size: 55,
			cell: ({ row }) => {
				const image = row.getValue("image") as string
				const name = row.getValue("name") as string

				const { props } = getImageProps({ src: image, width: 40, height: 40, alt: name })

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
			header: ({ column }) => <DataGridColumnHeader column={column} title="Nombre" visibility />,
			meta: {
				headerTitle: "Nombre",
			},
			cell: ({ row }) => {
				const user = row.original
				return (
					<UserDetailsDialog user={user}>
						<button className="text-left font-semibold text-purple-500 transition-colors hover:underline">
							{user.name}
						</button>
					</UserDetailsDialog>
				)
			},
		},
		{
			accessorKey: "email",
			header: ({ column }) => <DataGridColumnHeader column={column} title="Email" visibility />,
			meta: {
				headerTitle: "Email",
			},
		},
		{
			accessorKey: "phone",
			header: ({ column }) => <DataGridColumnHeader column={column} title="Telefono" visibility />,
			meta: {
				headerTitle: "Telefono",
			},
		},
		{
			accessorKey: "rut",
			header: ({ column }) => <DataGridColumnHeader column={column} title="RUT" visibility />,
			meta: {
				headerTitle: "RUT",
			},
		},
		{
			accessorKey: "internalRole",
			header: ({ column }) => <DataGridColumnHeader column={column} title="Cargo" visibility />,
			meta: {
				headerTitle: "Cargo",
			},
			cell: ({ row }) => {
				const internalRole = row.getValue("internalRole") as string

				if (!internalRole) return null

				return <Badge variant="secondary">{internalRole}</Badge>
			},
		},
		{
			accessorKey: "area",
			header: ({ column }) => <DataGridColumnHeader column={column} title="Area" visibility />,
			meta: {
				headerTitle: "Area",
			},
			cell: ({ row }) => {
				const area = row.getValue("area") as keyof typeof AreasLabels

				if (!area) return <span>-</span>

				return (
					<Badge variant="outline" className="bg-primary/10">
						{AreasLabels[area]}
					</Badge>
				)
			},
		},
		{
			accessorKey: "allowedModules",
			header: ({ column }) => <DataGridColumnHeader column={column} title="Modulos" visibility />,
			enableSorting: false,
			meta: {
				headerTitle: "Modulos",
			},
			cell: ({ row }) => {
				const modules = row.getValue("allowedModules") as string[]

				if (!modules || modules.length === 0) {
					return <Badge variant="secondary">Ninguno</Badge>
				}

				if (modules.includes("ALL")) {
					return (
						<Badge variant="default" className="bg-green-500">
							Todos
						</Badge>
					)
				}

				if (modules.length === 1) {
					return (
						<Badge variant="outline">
							{ModulesLabels[modules[0] as keyof typeof ModulesLabels]}
						</Badge>
					)
				}

				return <Badge variant="outline">{modules.length} modulos</Badge>
			},
		},
	]

	if (!hasPermission) return baseColumns

	return [
		...baseColumns,
		{
			id: "actions",
			header: ({ column }) => <DataGridColumnHeader column={column} title="Acciones" visibility />,
			enableSorting: false,
			meta: {
				headerTitle: "Acciones",
			},
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<InternalUser initialData={row.original} />
					<DeleteUser userId={row.original.id} />
				</div>
			),
		},
	]
}
