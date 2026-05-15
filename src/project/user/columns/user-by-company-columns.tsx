"use client"

import Link from "next/link"
import { getImageProps } from "next/image"
import {
	ClipboardListIcon,
	UserCheckIcon,
	UserXIcon,
	RotateCcwIcon,
	CheckCircle2Icon,
	XCircleIcon,
} from "lucide-react"
import { toast } from "sonner"

import UpdateExternalUserForm from "@/project/user/components/forms/UpdateExternalUserForm"
import DeleteExternalUserDialog from "@/project/user/components/forms/DeleteExternalUser"
import ReactivateExternalUserDialog from "../components/forms/ReactivateExternalUser"
import { DataGridColumnHeader } from "@/shared/components/data-grid/data-grid-column-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { DropdownMenuItem, DropdownMenuSeparator } from "@/shared/components/ui/dropdown-menu"
import ActionDataMenu from "@/shared/components/ActionDataMenu"
import { Badge } from "@/shared/components/ui/badge"
import { QRGenerationDialog } from "@/project/worker-compliance/components/QRGenerationDialog"
import { setAccreditationOverride } from "@/project/worker-compliance/actions/set-accreditation-override"

import type { UsersByCompany } from "@/project/user/hooks/use-users-by-company"
import type { ColumnDef, Row } from "@tanstack/react-table"

export const getUserByCompanyColumns = ({
	showAll,
	showReactivate,
	showQRActions,
}: {
	showAll?: boolean
	showReactivate?: boolean
	showQRActions?: boolean
}): ColumnDef<UsersByCompany>[] => [
	{
		id: "actions",
		header: "",
		enableSorting: false,
		meta: {
			headerTitle: "Acciones",
		},
		size: 40,
		enableResizing: false,
		cell: ({ row }) => {
			const user = row.original

			const handleOverride = async (value: boolean | null) => {
				try {
					await setAccreditationOverride(user.id, value)
					toast.success(
						value === null
							? "Acreditación restablecida a automático"
							: value
								? "Marcado como activo"
								: "Marcado como inactivo"
					)
				} catch (error) {
					toast.error(error instanceof Error ? error.message : "Error al actualizar acreditación")
				}
			}

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

						{showQRActions && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link
										href={`/dashboard/colaboradores/${user.id}/compliance`}
										className="flex items-center gap-2"
									>
										<ClipboardListIcon className="size-4" />
										Ver cumplimiento
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
									<QRGenerationDialog
										workerId={user.id}
										mode="admin"
										workerName={user.name}
										asMenuItem
									/>
								</DropdownMenuItem>

								<DropdownMenuSeparator />

								{user.accreditationOverride !== true && (
									<DropdownMenuItem onClick={() => handleOverride(true)}>
										<UserCheckIcon className="size-4" />
										Marcar como activo
									</DropdownMenuItem>
								)}

								{user.accreditationOverride !== false && (
									<DropdownMenuItem onClick={() => handleOverride(false)}>
										<UserXIcon className="size-4" />
										Marcar como inactivo
									</DropdownMenuItem>
								)}

								{user.accreditationOverride !== null && (
									<DropdownMenuItem onClick={() => handleOverride(null)}>
										<RotateCcwIcon className="size-4" />
										Automático
									</DropdownMenuItem>
								)}
							</>
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
			headerTitle: "Avatar",
		},
		size: 45,
		enableResizing: false,
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
		header: ({ column }) => <DataGridColumnHeader column={column} title="Nombre" visibility />,
		meta: {
			headerTitle: "Nombre",
		},
		cell: ({ row }) => {
			const name = row.getValue("name") as string
			return <span>{name}</span>
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
		accessorKey: "isAccredited",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Acreditación" visibility />
		),
		meta: {
			headerTitle: "Acreditación",
		},
		enableSorting: false,
		cell: ({ row }) => {
			const isAccredited = row.getValue("isAccredited") as boolean

			return (
				<Badge variant={"outline"} className="flex items-center gap-1.5 [&>svg]:size-3.5!">
					{isAccredited ? (
						<CheckCircle2Icon className="text-emerald-600 dark:text-emerald-500" />
					) : (
						<XCircleIcon className="text-rose-600 dark:text-rose-500" />
					)}
					<span
						className={
							isAccredited
								? "text-sm text-emerald-600 dark:text-emerald-500"
								: "text-sm text-rose-600 dark:text-rose-500"
						}
					>
						{isAccredited ? "Activo" : "Inactivo"}
					</span>
				</Badge>
			)
		},
	},
	{
		accessorKey: "internalRole",
		header: ({ column }) => <DataGridColumnHeader column={column} title="Cargo" visibility />,
		meta: {
			headerTitle: "Cargo",
		},
	},
	{
		accessorKey: "internalArea",
		header: ({ column }) => <DataGridColumnHeader column={column} title="Area" visibility />,
		meta: {
			headerTitle: "Area",
		},
	},
	{
		accessorKey: "isSupervisor",
		header: ({ column }) => <DataGridColumnHeader column={column} title="Supervisor" visibility />,
		meta: {
			headerTitle: "Supervisor",
		},
		cell: ({ row }) => {
			const isSupervisor = row.getValue("isSupervisor") as boolean

			return isSupervisor ? "Sí" : "No"
		},
	},
	...(showAll
		? [
				{
					accessorKey: "isActive",
					header: ({ column }: { column: any }) => (
						<DataGridColumnHeader column={column} title="Habilitado" visibility />
					),
					meta: {
						headerTitle: "Habilitado",
					},
					cell: ({ row }: { row: Row<UsersByCompany> }) => {
						const isActive = row.getValue("isActive") as boolean

						return (
							<Badge variant={isActive ? "default" : "destructive"}>
								{isActive ? "Habilitado" : "Deshabilitado"}
							</Badge>
						)
					},
				},
			]
		: []),
]
