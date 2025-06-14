"use client"

import { Building2Icon, PrinterIcon } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { WorkPermitStatusLabels } from "@/lib/consts/work-permit-status"

import { Button } from "@/shared/components/ui/button"

import type { AdminWorkPermit } from "@/features/work-permit/hooks/use-admin-work-permits"

export const adminWorkPermitColumns: ColumnDef<AdminWorkPermit>[] = [
	{
		accessorKey: "executanCompany",
		header: "Empresa ejecutora",
		cell: ({ row }) => {
			const company = row.original.company.name
			return (
				<div className="flex items-center gap-1 truncate">
					<Building2Icon className="size-4" />
					{company}
				</div>
			)
		},
	},
	{
		accessorKey: "workName",
		header: "Trabajo a realizar",
		cell: ({ row }) => {
			const workOrder = row.original.otNumber.workName
			return <div className="truncate">{workOrder}</div>
		},
	},
	{
		accessorKey: "exactPlace",
		header: "Lugar exacto",
	},
	{
		accessorKey: "status",
		header: "Estado",
		cell: ({ row }) => {
			const status = row.original.status
			return (
				<div className="truncate">
					{WorkPermitStatusLabels[status as keyof typeof WorkPermitStatusLabels]}
				</div>
			)
		},
	},
	{
		accessorKey: "actions",
		header: "Acciones",
		cell: ({ row }) => {
			const id = row.original.id

			return (
				<div className="flex items-center gap-2">
					<Link href={`/api/work-permit/pdf/${id}`} target="_blank">
						<Button
							size={"icon"}
							variant={"ghost"}
							className="cursor-pointer text-indigo-500 hover:bg-indigo-500 hover:text-white"
						>
							<PrinterIcon className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			)
		},
	},
]
