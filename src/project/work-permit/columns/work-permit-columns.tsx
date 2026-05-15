"use client"

import { MapPinnedIcon, PenBoxIcon, PrinterIcon } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import { WorkPermitStatusLabels } from "@/lib/consts/work-permit-status"
import { WORK_PERMIT_STATUS } from "@/generated/prisma/enums"
import { cn } from "@/lib/utils"

import { ViewLockoutPermitsSheet } from "@/project/lockout-permit/components/ViewLockoutPermitsSheet"
import { DataGridColumnHeader } from "@/shared/components/data-grid/data-grid-column-header"
import WorkPermitAttachmentForm from "../components/forms/WorkPermitAttachmentForm"
import CompanyHoverCard from "@/shared/components/data/CompanyHoverCard"
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu"
import ApproveWorkPermit from "../components/forms/ApproveWorkPermit"
import UserHoverCard from "@/shared/components/data/UserHoverCard"
import CloseWorkPermit from "../components/forms/CloseWorkPermit"
import ActionDataMenu from "@/shared/components/ActionDataMenu"
import { Badge } from "@/shared/components/ui/badge"

import type { WorkPermit } from "@/project/work-permit/hooks/use-work-permit"

export const getWorkPermitColumns = (hasPermission: boolean): ColumnDef<WorkPermit>[] => [
	{
		accessorKey: "actions",
		header: "",
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
			const hasStatusActive = row.original.status === WORK_PERMIT_STATUS.ACTIVE

			return (
				<div onClick={(event) => event.stopPropagation()}>
					<ActionDataMenu>
						<div className="flex w-full flex-col items-start justify-start">
							{hasPermission && row.original.status === WORK_PERMIT_STATUS.REVIEW_PENDING && (
								<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
									<ApproveWorkPermit workPermitId={id} />
								</DropdownMenuItem>
							)}

							{hasPermission && hasStatusActive && (
								<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
									<CloseWorkPermit workPermitId={id} />
								</DropdownMenuItem>
							)}

							<DropdownMenuItem asChild>
								<Link
									href={`/admin/dashboard/permisos-de-trabajo/${id}/pdf`}
									className="text-text flex cursor-pointer px-3 font-semibold"
								>
									<PrinterIcon className="h-4 w-4 text-orange-500" /> Imprimir Permiso de Trabajo
								</Link>
							</DropdownMenuItem>

							<ViewLockoutPermitsSheet workPermit={row.original} isInternalMember={hasPermission} />

							<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
								<WorkPermitAttachmentForm workPermitId={row.original.id} />
							</DropdownMenuItem>

							<DropdownMenuItem asChild>
								<Link
									href={`/admin/dashboard/permisos-de-trabajo/${id}`}
									className="text-text flex w-full cursor-pointer px-3 font-semibold"
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
		accessorKey: "lockoutPermits",
		header: ({ column }) => <DataGridColumnHeader column={column} title="LOTO" visibility />,
		enableSorting: false,
		size: 80,
		meta: {
			headerTitle: "LOTO",
		},
		cell: ({ row }) => {
			const lockoutPermits = row.original.lockoutPermits
			return (
				<div className="flex items-center gap-1 truncate">
					<Badge
						variant="outline"
						className={cn("bg-neutral-500/20 text-xs", {
							"border-green-500 bg-green-500/10 text-green-500": lockoutPermits.length > 0,
						})}
					>
						{lockoutPermits.length > 0 ? "Si" : "No"}
					</Badge>
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
			const isUrgent = row.original.isUrgent

			return (
				<div className="font-semibold text-rose-500">
					{isUrgent ? <span className="text-rose-500">URGENTE</span> : otNumber}
				</div>
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
			const user = row.original.user
			return <UserHoverCard name={user.name} rut={user.rut} />
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
			const company = row.original.company

			return (
				<CompanyHoverCard
					name={company.name}
					rut={company.rut}
					href={`/admin/dashboard/empresas/${company.id}`}
				/>
			)
		},
	},
	{
		accessorKey: "approvalBy",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Aprobado por" visibility />
		),
		enableSorting: true,
		meta: {
			headerTitle: "Aprobado por",
		},
		cell: ({ row }) => {
			const approvalBy = row.original.approvalBy

			if (!approvalBy) {
				return <span>-</span>
			}

			return <UserHoverCard name={approvalBy.name} rut={approvalBy.rut} />
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
			const workOrder = row.original.otNumber?.workRequest
			const isUrgent = row.original.isUrgent

			return (
				<div className="line-clamp-1 w-56 truncate text-wrap">
					{isUrgent ? <span className="text-rose-500">Permiso Urgente</span> : workOrder}
				</div>
			)
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
				<div className="line-clamp-1 flex w-56 items-center gap-1.5 truncate text-wrap">
					<MapPinnedIcon className="text-muted-foreground size-4" />
					<span className="w-full truncate text-nowrap">{exactPlace}</span>
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
