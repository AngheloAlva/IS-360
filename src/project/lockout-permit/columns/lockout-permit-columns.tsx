"use client"

import { Building2Icon, PenBoxIcon, PrinterIcon, UserIcon, LockIcon } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import { LOCKOUT_PERMIT_STATUS, LOCKOUT_TYPE } from "@prisma/client"
import { LockoutPermitResponse } from "../hooks/use-lockout-permit"
import { cn } from "@/lib/utils"

import LockoutPermitAttachmentForm from "../components/forms/LockoutPermitAttachmentForm"
import LockoutPermitDetailsDialog from "../components/dialogs/LockoutPermitDetailsDialog"
import CompleteLockoutPermit from "../components/forms/CompleteLockoutPermit"
import ApproveLockoutPermit from "../components/forms/ApproveLockoutPermit"
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu"
import ActionDataMenu from "@/shared/components/ActionDataMenu"
import { Badge } from "@/shared/components/ui/badge"

const LockoutPermitStatusLabels = {
	[LOCKOUT_PERMIT_STATUS.REVIEW_PENDING]: "Pendiente de Revisión",
	[LOCKOUT_PERMIT_STATUS.ACTIVE]: "Activo",
	[LOCKOUT_PERMIT_STATUS.COMPLETED]: "Completado",
	[LOCKOUT_PERMIT_STATUS.REJECTED]: "Rechazado",
}

const LockoutPermitTypeLabels = {
	[LOCKOUT_TYPE.CORRECTIVE]: "Correctivo",
	[LOCKOUT_TYPE.PREVENTIVE]: "Preventivo",
	[LOCKOUT_TYPE.EMERGENCY]: "Emergencia",
	[LOCKOUT_TYPE.OTHER]: "Otro",
}

export const getLockoutPermitColumns = (
	hasPermission: boolean,
	userId: string
): ColumnDef<LockoutPermitResponse["lockoutPermits"][number]>[] => [
	{
		accessorKey: "actions",
		header: "",
		cell: ({ row }) => {
			const id = row.original.id

			return (
				<ActionDataMenu>
					<>
						{hasPermission && row.original.status === LOCKOUT_PERMIT_STATUS.REVIEW_PENDING && (
							<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
								<ApproveLockoutPermit lockoutPermitId={id} />
							</DropdownMenuItem>
						)}

						{hasPermission && row.original.status === LOCKOUT_PERMIT_STATUS.ACTIVE && (
							<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
								<CompleteLockoutPermit lockoutPermitId={id} />
							</DropdownMenuItem>
						)}

						<DropdownMenuItem asChild>
							<Link
								href={`/admin/dashboard/solicitudes-de-bloqueo/${id}/pdf`}
								className="text-text flex cursor-pointer px-3 font-medium"
							>
								<PrinterIcon className="h-4 w-4 text-orange-500" /> Imprimir
							</Link>
						</DropdownMenuItem>

						<DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
							<LockoutPermitAttachmentForm
								userId={userId}
								lockoutPermitId={row.original.id}
								companyId={row.original.company.id}
							/>
						</DropdownMenuItem>

						<DropdownMenuItem asChild>
							<Link
								href={`/admin/dashboard/solicitudes-de-bloqueo/${id}`}
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
			const otNumber = row.original.otNumberRef?.otNumber

			return (
				<LockoutPermitDetailsDialog lockoutPermitId={row.original.id}>
					<div className="cursor-pointer font-semibold text-yellow-500 hover:underline">
						{otNumber || "N/A"}
					</div>
				</LockoutPermitDetailsDialog>
			)
		},
	},
	{
		accessorKey: "requestedBy",
		header: "Solicitado por",
		cell: ({ row }) => {
			const requestedBy = row.original.requestedBy
			return (
				<div className="flex items-center gap-1 truncate">
					<UserIcon className="text-muted-foreground size-4" />
					{requestedBy.name}
				</div>
			)
		},
	},
	{
		accessorKey: "company",
		header: "Empresa",
		cell: ({ row }) => {
			const company = row.original.company

			return (
				<Link
					href={`/admin/dashboard/empresas/${company.id}`}
					className="flex w-56 items-center gap-1.5 truncate hover:text-orange-500 hover:underline"
				>
					<Building2Icon className="text-muted-foreground size-4" />
					<span className="truncate text-nowrap">{company.name}</span>
				</Link>
			)
		},
	},
	{
		accessorKey: "equipments",
		header: "Equipos",
		cell: ({ row }) => {
			const equipments = row.original.equipments
			const firstEquipment = equipments[0]
			const moreCount = equipments.length - 1
			return (
				<div className="line-clamp-1 flex w-56 items-center gap-1.5 truncate text-wrap">
					<LockIcon className="text-muted-foreground size-4" />
					<span className="w-full truncate text-nowrap">
						{firstEquipment?.name || "Sin equipos"}
						{moreCount > 0 && ` +${moreCount} más`}
					</span>
				</div>
			)
		},
	},
	{
		accessorKey: "areaResponsible",
		header: "Responsable de Área",
		cell: ({ row }) => {
			const areaResponsible = row.original.areaResponsible
			return (
				<div className="flex items-center gap-1 truncate">
					<UserIcon className="text-muted-foreground size-4" />
					<span className="truncate text-nowrap">{areaResponsible.name}</span>
				</div>
			)
		},
	},
	{
		accessorKey: "lockoutType",
		header: "Tipo de Bloqueo",
		cell: ({ row }) => {
			const lockoutType = row.original.lockoutType
			return (
				<Badge variant="outline" className="truncate">
					{LockoutPermitTypeLabels[lockoutType as keyof typeof LockoutPermitTypeLabels]}
				</Badge>
			)
		},
	},
	{
		accessorKey: "supervisor",
		header: "Supervisor",
		cell: ({ row }) => {
			const supervisor = row.original.supervisor

			return (
				<div className="flex w-52 items-center gap-1 truncate">
					<UserIcon className="text-muted-foreground size-4" />
					<span className="truncate text-nowrap">{supervisor?.name || "-"}</span>
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
						"bg-red-500/10 text-red-500": status === LOCKOUT_PERMIT_STATUS.REJECTED,
						"bg-fuchsia-500/10 text-fuchsia-500": status === LOCKOUT_PERMIT_STATUS.ACTIVE,
						"bg-green-500/10 text-green-500": status === LOCKOUT_PERMIT_STATUS.COMPLETED,
					})}
				>
					{LockoutPermitStatusLabels[status as keyof typeof LockoutPermitStatusLabels]}
				</Badge>
			)
		},
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
		header: "Registros",
		cell: ({ row }) => {
			const lockouts = row.original._count.lockoutRegistrations
			const reviews = row.original._count.zeroEnergyReviews
			return (
				<div className="text-sm">
					<div>{lockouts} bloqueos</div>
					<div>{reviews} revisiones</div>
				</div>
			)
		},
	},
]
