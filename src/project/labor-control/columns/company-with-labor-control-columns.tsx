import { getImageProps } from "next/image"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"

import type { CompanyWithLaborControlFolder } from "../hooks/use-companies-with-labor-control-folder"
import type { ColumnDef } from "@tanstack/react-table"

export const companyWithLaborControlColumns: ColumnDef<CompanyWithLaborControlFolder>[] = [
	{
		id: "name",
		header: "Nombre ",
		cell: ({ row }) => {
			const image = row.original.image
			const name = row.original.name

			const { props } = getImageProps({
				alt: name,
				width: 40,
				height: 40,
				src: image || "",
			})

			return (
				<div className="flex items-center gap-2">
					<Avatar className="size-8 text-sm">
						<AvatarImage {...props} />
						<AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
					</Avatar>

					<p className="font-semibold">{name}</p>
				</div>
			)
		},
	},
	{
		id: "rut",
		header: "RUT",
		accessorKey: "rut",
	},
	{
		id: "laborControlFolders",
		header: "¿Carpetas en revisión?",
		cell: ({ row }) => {
			const laborControlFolders = row.original.laborControlFolders

			const hasFoldersInReview =
				laborControlFolders._count?.workerFolders > 0 || laborControlFolders._count?.documents > 0

			return <p>{hasFoldersInReview ? "Sí" : "No"}</p>
		},
	},
]
