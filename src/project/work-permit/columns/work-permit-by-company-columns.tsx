"use client"

import { Building2Icon, PenBoxIcon, PrinterIcon, UserIcon } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import { WorkPermitStatusLabels } from "@/lib/consts/work-permit-status"
import { WORK_PERMIT_STATUS } from "@prisma/client"
import { cn } from "@/lib/utils"

import WorkPermitAttachmentForm from "../components/forms/WorkPermitAttachmentForm"
import WorkPermitDetailsDialog from "../components/dialogs/WorkPermitDetailsDialog"
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu"
import ActionDataMenu from "@/shared/components/ActionDataMenu"
import { Badge } from "@/shared/components/ui/badge"

import type { WorkPermit } from "@/project/work-permit/hooks/use-work-permit"

export const getWorkPermitByCompanyColumns = (userId: string): ColumnDef<WorkPermit>[] => [
	{
		accessorKey: "actions",
		header: "",
		cell: ({ row }) => {
			const id = row.original.id

			return (
				<ActionDataMenu>
					<>
						<DropdownMenuItem asChild>
							<Link
								href={`/dashboard/permiso-de-trabajo/${id}/pdf`}
								className="text-text flex cursor-pointer px-3 font-medium"
							>
								<PrinterIcon className="h-4 w-4 text-rose-500" /> Imprimir
							</Link>
						</DropdownMenuItem>

						<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
							<WorkPermitAttachmentForm
								userId={userId}
								workPermitId={row.original.id}
								companyId={row.original.company.id}
							/>
						</DropdownMenuItem>

						<DropdownMenuItem asChild>
							<Link
								href={`/dashboard/permiso-de-trabajo/${id}`}
								className="text-text flex cursor-pointer px-3 font-medium"
							>
								<PenBoxIcon className="h-4 w-4 text-indigo-500" /> Editar
							</Link>
						</DropdownMenuItem>
					</>
				</ActionDataMenu>
			)
		},
	},
	{
		accessorKey: "otNumber",
		header: "OT",
		cell: ({ row }) => {
			const otNumber = row.original.otNumber.otNumber

			return (
				<WorkPermitDetailsDialog workPermit={row.original} className="bg-indigo-500">
					<div className="cursor-pointer font-semibold text-indigo-500 hover:underline">
						{otNumber}
					</div>
				</WorkPermitDetailsDialog>
			)
		},
	},
	{
		accessorKey: "aplicantPt",
		header: "Solicitante PT",
		cell: ({ row }) => {
			const aplicantPt = row.original.user.name
			return (
				<div className="flex items-center gap-1 truncate">
					<UserIcon className="text-muted-foreground size-4" />
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
				<div className="flex items-center gap-1.5 truncate">
					<Building2Icon className="text-muted-foreground size-4" />
					{company}
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
				<Badge
					className={cn("bg-purple-500/10 text-purple-500", {
						"bg-indigo-500/10 text-indigo-500": status === WORK_PERMIT_STATUS.CANCELLED,
						"bg-red-500/10 text-red-500": status === WORK_PERMIT_STATUS.REJECTED,
						"bg-fuchsia-500/10 text-fuchsia-500": status === WORK_PERMIT_STATUS.ACTIVE,
					})}
				>
					{WorkPermitStatusLabels[status as keyof typeof WorkPermitStatusLabels]}
				</Badge>
			)
		},
	},
	{
		accessorKey: "workName",
		header: "Trabajo a realizar",
		cell: ({ row }) => {
			const workOrder = row.original.otNumber.workName
			return <div className="w-96 text-wrap">{workOrder}</div>
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
]
