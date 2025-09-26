"use client"

import { FolderLockIcon } from "lucide-react"
import Link from "next/link"

import { LABOR_CONTROL_STATUS } from "@prisma/client"

import { LaborControlFolderStatusBadge } from "../components/data/LaborControlFolderStatusBadge"

import type { ColumnDef } from "@tanstack/react-table"
import type { WorkerLaborControlFolder } from "../types"
import { generateSlug } from "@/lib/generateSlug"

interface GetDocumentColumnsProps {
	folderId: string
	companyId: string
	isOtcMember: boolean
}

export const getWorkersLaborControlFoldersColumns = ({
	folderId,
	companyId,
	isOtcMember,
}: GetDocumentColumnsProps): ColumnDef<WorkerLaborControlFolder>[] => [
	{
		accessorKey: "name",
		header: "Nombre Trabajador",
		cell: ({ row }) => {
			const workerFolderId = row.original.id
			const workerName = row.original.worker.name
			const workerNameSlug = generateSlug(workerName)
			const workerFolderSlug = workerNameSlug + "_" + workerFolderId

			return (
				<Link
					href={
						isOtcMember
							? `/admin/dashboard/control-laboral/${companyId}/${folderId}/acreditacion-trabajadores/${workerFolderSlug}`
							: `/dashboard/control-laboral/${folderId}/acreditacion-trabajadores/${workerFolderSlug}`
					}
					className="flex items-center gap-2 font-medium"
				>
					<FolderLockIcon className="h-4 w-4 fill-sky-500/20 text-sky-500" />
					{workerName}
				</Link>
			)
		},
	},
	{
		accessorKey: "status",
		header: "Estado Carpeta",
		cell: ({ row }) => {
			const status = row.getValue("status") as LABOR_CONTROL_STATUS

			return <LaborControlFolderStatusBadge status={status} />
		},
	},
]
