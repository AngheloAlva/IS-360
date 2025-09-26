import { FolderClockIcon } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import { LaborControlFolderStatusBadge } from "../components/data/LaborControlFolderStatusBadge"

import type { LaborControlFolderByCompany } from "../hooks/use-labor-control-folder-by-company"
import type { ColumnDef } from "@tanstack/react-table"
import { generateSlug } from "@/lib/generateSlug"

interface LaborControlFoldersByCompanyColumnsProps {
	companyId: string
	companySlug?: string
	isOtcMember?: boolean
}

export const LaborControlFoldersByCompanyColumns: (
	props: LaborControlFoldersByCompanyColumnsProps
) => ColumnDef<LaborControlFolderByCompany>[] = ({ companyId, isOtcMember, companySlug }) => [
	{
		id: "name",
		header: "Nombre ",
		cell: ({ row }) => {
			const createdAt = row.original.createdAt
			const companyHref = companySlug ? companySlug + "_" + companyId : companyId

			const folderName = format(new Date(createdAt), "MMMM yyyy", { locale: es })
			const folderSlug = generateSlug(folderName) + "_" + row.original.id

			const href = isOtcMember
				? `/admin/dashboard/control-laboral/${companyHref}/${folderSlug}`
				: `/dashboard/control-laboral/${folderSlug}`

			return (
				<Link href={href} className="flex items-center gap-2 capitalize">
					<FolderClockIcon className="size-4 fill-blue-500/40 text-blue-500" />
					{format(new Date(createdAt), "MMMM yyyy", { locale: es })}
				</Link>
			)
		},
	},
	{
		id: "status",
		header: "Estado",
		cell: ({ row }) => {
			const status = row.original.status

			return <LaborControlFolderStatusBadge status={status} />
		},
	},
]
