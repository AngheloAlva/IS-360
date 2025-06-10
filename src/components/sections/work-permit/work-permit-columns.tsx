"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Building2Icon, PrinterIcon, UserIcon } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import { WorkPermitStatusLabels } from "@/lib/consts/work-permit-status"

import { Button } from "@/components/ui/button"

import type { WorkPermit } from "@/hooks/work-permit/use-work-permit"

export const workPermitColumns: ColumnDef<WorkPermit>[] = [
	{
		accessorKey: "otNumber",
		header: "OT",
		cell: ({ row }) => {
			const otNumber = row.original.otNumber.otNumber
			return <div className="truncate">{otNumber}</div>
		},
	},
	{
		accessorKey: "aplicantPt",
		header: "Solicitante PT",
		cell: ({ row }) => {
			const aplicantPt = row.original.user.name
			return (
				<div className="flex items-center gap-1 truncate">
					<UserIcon className="size-4" />
					{aplicantPt}
				</div>
			)
		},
	},
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
		accessorKey: "startDate",
		header: "Fecha de inicio",
		cell: ({ row }) => {
			const startDate = row.original.startDate
			return <div className="truncate">{format(startDate, "dd/MM/yyyy", { locale: es })}</div>
		},
	},
	{
		accessorKey: "endDate",
		header: "Fecha de finalización",
		cell: ({ row }) => {
			const endDate = row.original.endDate
			return <div className="truncate">{format(endDate, "dd/MM/yyyy", { locale: es })}</div>
		},
	},
	{
		accessorKey: "_count",
		header: "Participantes",
		cell: ({ row }) => {
			const participants = row.original._count.participants
			return (
				<div>
					{participants > 1 ? participants + " participantes" : participants + " participante"}
				</div>
			)
		},
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
