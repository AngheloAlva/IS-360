"use client"

import { Building2Icon, MapPinnedIcon, PenBoxIcon, PrinterIcon, UserIcon } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import { WorkPermitStatusLabels } from "@/lib/consts/work-permit-status"
import { WORK_PERMIT_STATUS } from "@/generated/prisma/enums"
import { cn } from "@/lib/utils"

import InstallContractorLockDialog from "@/project/lockout-permit/components/dialogs/InstallContractorLockDialog"
import WorkPermitAttachmentForm from "../components/forms/WorkPermitAttachmentForm"
import WorkPermitDetailsDialog from "../components/dialogs/WorkPermitDetailsDialog"
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu"
import ActionDataMenu from "@/shared/components/ActionDataMenu"
import { Badge } from "@/shared/components/ui/badge"
import { DataGridColumnHeader } from "@/shared/components/data-grid/data-grid-column-header"

import type { WorkPermit } from "@/project/work-permit/hooks/use-work-permit"
import { ViewLockoutPermitsSheet } from "@/project/lockout-permit/components/ViewLockoutPermitsSheet"

export const getWorkPermitByCompanyColumns = (): ColumnDef<WorkPermit>[] => [
	{
		accessorKey: "actions",
		header: ({ column }) => <DataGridColumnHeader column={column} title="" visibility />,
		enableSorting: false,
		enableResizing: false,
		enablePinning: false,
		enableHiding: false,
		size: 52,
		maxSize: 52,
		meta: {
			headerTitle: "Acciones",
		},
		cell: ({ row }) => {
			const id = row.original.id
			const hasLockoutPermit = row.original.lockoutPermits.length > 0

			const lockoutPermit = hasLockoutPermit ? row.original.lockoutPermits[0] : null
			const registrations = lockoutPermit?.lockoutRegistrations || []

			const contractorRegistration = registrations.find((reg) => reg.contractorLockNumber)

			const canInstallContractorLock = hasLockoutPermit && !contractorRegistration

			return (
				<div onClick={(event) => event.stopPropagation()}>
					<ActionDataMenu>
						<div className="flex flex-col items-start justify-start">
							{canInstallContractorLock && (
								<DropdownMenuItem onClick={(e) => e.preventDefault()}>
									<InstallContractorLockDialog
										workerName={row.original.user.name}
										lockoutPermitId={lockoutPermit!.id}
									/>
								</DropdownMenuItem>
							)}

							<DropdownMenuItem onClick={(e) => e.preventDefault()}>
								<Link
									href={`/dashboard/permiso-de-trabajo/${id}/pdf`}
									className="flex w-full items-center justify-start gap-2 px-1 font-semibold"
								>
									<PrinterIcon className="h-4 w-4 text-orange-500" /> Imprimir
								</Link>
							</DropdownMenuItem>

							<DropdownMenuItem onClick={(e) => e.preventDefault()}>
								<WorkPermitAttachmentForm workPermitId={row.original.id} />
							</DropdownMenuItem>

							<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
								<ViewLockoutPermitsSheet workPermit={row.original} isOtcMember={false} />
							</DropdownMenuItem>

							<DropdownMenuItem onClick={(e) => e.preventDefault()}>
								<Link
									href={`/dashboard/permiso-de-trabajo/${id}`}
									className="flex w-full items-center justify-start gap-2 px-1 font-semibold"
								>
									<PenBoxIcon className="h-4 w-4 text-indigo-500" /> Editar
								</Link>
							</DropdownMenuItem>
						</div>
					</ActionDataMenu>
				</div>
			)
		},
	},
	{
		accessorKey: "otNumber",
		header: ({ column }) => <DataGridColumnHeader column={column} title="OT" visibility />,
		enableSorting: true,
		meta: {
			headerTitle: "OT",
		},
		cell: ({ row }) => {
			const otNumber = row.original.otNumber?.otNumber

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
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Solicitante PT" visibility />
		),
		enableSorting: true,
		meta: {
			headerTitle: "Solicitante PT",
		},
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
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Empresa ejecutora" visibility />
		),
		enableSorting: true,
		meta: {
			headerTitle: "Empresa ejecutora",
		},
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
		header: ({ column }) => <DataGridColumnHeader column={column} title="Estado" visibility />,
		enableSorting: true,
		meta: {
			headerTitle: "Estado",
		},
		cell: ({ row }) => {
			const status = row.original.status
			return (
				<Badge
					className={cn("bg-purple-500/10 text-purple-500", {
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
		accessorKey: "workBookName",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Trabajo a realizar" visibility />
		),
		enableSorting: false,
		meta: {
			headerTitle: "Trabajo a realizar",
		},
		cell: ({ row }) => {
			const workOrder = row.original.otNumber?.workBookName
			return <div className="max-w-56 min-w-36 text-wrap">{workOrder}</div>
		},
	},
	{
		accessorKey: "exactPlace",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Lugar exacto" visibility />
		),
		enableSorting: true,
		meta: {
			headerTitle: "Lugar exacto",
		},
		cell: ({ row }) => {
			const exactPlace = row.original.exactPlace
			return (
				<div className="flex max-w-56 min-w-32 items-center gap-1.5 truncate">
					<MapPinnedIcon className="text-muted-foreground size-4" />
					{exactPlace}
				</div>
			)
		},
	},
	{
		accessorKey: "startDate",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Fecha de inicio" visibility />
		),
		enableSorting: true,
		meta: {
			headerTitle: "Fecha de inicio",
		},
		cell: ({ row }) => {
			const startDate = row.original.startDate
			return <div className="truncate">{format(startDate, "dd/MM/yyyy", { locale: es })}</div>
		},
	},
	{
		accessorKey: "endDate",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Fecha de finalizacion" visibility />
		),
		enableSorting: true,
		meta: {
			headerTitle: "Fecha de finalizacion",
		},
		cell: ({ row }) => {
			const endDate = row.original.endDate
			return <div className="truncate">{format(endDate, "dd/MM/yyyy", { locale: es })}</div>
		},
	},
	{
		accessorKey: "_count",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Participantes" visibility />
		),
		enableSorting: false,
		meta: {
			headerTitle: "Participantes",
		},
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
