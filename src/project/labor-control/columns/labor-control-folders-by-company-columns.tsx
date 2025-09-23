import { FolderIcon } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import type { LaborControlFolderByCompany } from "../hooks/use-labor-control-folder-by-company"
import type { ColumnDef } from "@tanstack/react-table"

export const LaborControlFoldersByCompanyColumns: (
	companyId: string,
	isOtcMember?: boolean
) => ColumnDef<LaborControlFolderByCompany>[] = (companyId, isOtcMember) => [
	{
		id: "name",
		header: "Nombre ",
		cell: ({ row }) => {
			const createdAt = row.original.createdAt

			const href = isOtcMember
				? `/admin/dashboard/control-laboral/${companyId}/${row.original.id}`
				: `/dashboard/control-laboral/${row.original.id}`

			return (
				<Link href={href} className="flex items-center gap-2">
					<FolderIcon className="text-muted-foreground size-3.5" />
					{format(new Date(createdAt), "PPP", { locale: es })}
				</Link>
			)
		},
	},
	{
		id: "status",
		header: "Estado",
		cell: ({ row }) => {
			const status = row.original.status

			return <p>{status}</p>
		},
	},
]
