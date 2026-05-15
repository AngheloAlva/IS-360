"use client"

import { ColumnDef } from "@tanstack/react-table"
import { getImageProps } from "next/image"

import { ActivityTypeLabels } from "@/lib/consts/activity-types"
import { EntityTypeLabels } from "@/lib/consts/entity-types"
import { ModulesLabels } from "@/lib/consts/modules"
import { resolveActorDisplay } from "@/project/activity-log/utils/resolve-actor-display"

import { DataGridColumnHeader } from "@/shared/components/data-grid/data-grid-column-header"
import CompanyHoverCard from "@/shared/components/data/CompanyHoverCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Badge } from "@/shared/components/ui/badge"

import type { ACTIVITY_SEVERITY } from "@/generated/prisma/enums"
import type { ApiActivityLog } from "@/project/activity-log/types/api-activity-log"

const actionVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
	CREATE: "default",
	APPROVE: "default",
	COMPLETE: "default",
	UPDATE: "secondary",
	SUBMIT: "secondary",
	UPLOAD: "secondary",
	COMMENT: "secondary",
	ASSIGN: "secondary",
	VIEW: "outline",
	DOWNLOAD: "outline",
	LOGIN: "outline",
	LOGOUT: "outline",
	DELETE: "destructive",
	REJECT: "destructive",
	CANCEL: "destructive",
	UNASSIGN: "destructive",
}

const severityVariants: Record<
	ACTIVITY_SEVERITY,
	"default" | "secondary" | "destructive" | "outline"
> = {
	LOW: "secondary",
	MEDIUM: "outline",
	HIGH: "default",
	CRITICAL: "destructive",
}

const severityLabels: Record<ACTIVITY_SEVERITY, string> = {
	LOW: "Baja",
	MEDIUM: "Media",
	HIGH: "Alta",
	CRITICAL: "Crítica",
}

export const getActivityLogColumns = (): ColumnDef<ApiActivityLog>[] => [
	{
		accessorKey: "user",
		header: "",
		enableSorting: false,
		meta: { headerTitle: "Avatar" },
		size: 55,
		cell: ({ row }) => {
			const actorLabel = resolveActorDisplay(row.original)
			const image = row.original.user?.image || ""
			const { props } = getImageProps({
				src: image,
				width: 40,
				height: 40,
				alt: actorLabel,
			})

			return (
				<Avatar className="size-8 text-sm">
					<AvatarImage {...props} />
					<AvatarFallback>{actorLabel.slice(0, 2)}</AvatarFallback>
				</Avatar>
			)
		},
	},
	{
		id: "userName",
		accessorFn: (row) => resolveActorDisplay(row),
		header: ({ column }) => <DataGridColumnHeader column={column} title="Actor" visibility />,
		meta: { headerTitle: "Actor" },
		enableSorting: false,
		cell: ({ row }) => {
			const actorLabel = resolveActorDisplay(row.original)
			const email = row.original.user?.email ?? row.original.externalActor?.email ?? null
			return (
				<div className="flex flex-col">
					<span className="font-medium">{actorLabel}</span>
					{email && <span className="text-xs text-muted-foreground">{email}</span>}
				</div>
			)
		},
	},
	{
		id: "company",
		header: ({ column }) => <DataGridColumnHeader column={column} title="Empresa" visibility />,
		meta: { headerTitle: "Empresa" },
		enableSorting: false,
		cell: ({ row }) => {
			const company = row.original.user?.company
			if (!company) return null

			return (
				<CompanyHoverCard
					href={`/admin/dashboard/empresas/${company.id}`}
					name={company.name}
					rut={company.rut}
					image={company.image}
				/>
			)
		},
	},
	{
		accessorKey: "severity",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Severidad" visibility />
		),
		meta: { headerTitle: "Severidad" },
		enableSorting: false,
		cell: ({ row }) => {
			const severity = row.original.severity
			if (!severity) return <span className="text-muted-foreground">—</span>
			return (
				<Badge variant={severityVariants[severity]}>{severityLabels[severity]}</Badge>
			)
		},
	},
	{
		accessorKey: "action",
		header: ({ column }) => <DataGridColumnHeader column={column} title="Acción" visibility />,
		meta: { headerTitle: "Acción" },
		cell: ({ row }) => {
			const action = row.getValue("action") as string
			const variant = actionVariants[action] ?? "outline"
			return <Badge variant={variant}>{ActivityTypeLabels[action] ?? action}</Badge>
		},
	},
	{
		accessorKey: "module",
		header: ({ column }) => <DataGridColumnHeader column={column} title="Módulo" visibility />,
		meta: { headerTitle: "Módulo" },
		cell: ({ row }) => {
			const module = row.getValue("module") as string
			return (
				<Badge variant="outline" className="bg-primary/10">
					{ModulesLabels[module as keyof typeof ModulesLabels] ?? module}
				</Badge>
			)
		},
	},
	{
		accessorKey: "entityType",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="Tipo de entidad" visibility />
		),
		meta: { headerTitle: "Tipo de entidad" },
		cell: ({ row }) => {
			const entityType = row.getValue("entityType") as string
			return <span>{EntityTypeLabels[entityType] ?? entityType}</span>
		},
	},
	{
		accessorKey: "entityId",
		header: ({ column }) => (
			<DataGridColumnHeader column={column} title="ID Entidad" visibility />
		),
		meta: { headerTitle: "ID Entidad" },
		cell: ({ row }) => {
			const entityId = row.getValue("entityId") as string
			return (
				<span className="max-w-[120px] truncate font-mono text-xs" title={entityId}>
					{entityId}
				</span>
			)
		},
	},
	{
		id: "changes",
		header: ({ column }) => <DataGridColumnHeader column={column} title="Cambios" visibility />,
		meta: { headerTitle: "Cambios" },
		enableSorting: false,
		cell: ({ row }) => {
			const { changesBefore, changesAfter } = row.original
			if (!changesBefore && !changesAfter) return null
			return (
				<details>
					<summary className="cursor-pointer text-sm">Ver cambios</summary>
					<div className="mt-2 grid grid-cols-2 gap-4">
						<div>
							<div className="font-medium text-muted-foreground">Antes</div>
							<pre className="overflow-auto text-xs">
								{JSON.stringify(changesBefore, null, 2)}
							</pre>
						</div>
						<div>
							<div className="font-medium text-muted-foreground">Después</div>
							<pre className="overflow-auto text-xs">
								{JSON.stringify(changesAfter, null, 2)}
							</pre>
						</div>
					</div>
				</details>
			)
		},
	},
	{
		accessorKey: "timestamp",
		header: ({ column }) => <DataGridColumnHeader column={column} title="Fecha" visibility />,
		meta: { headerTitle: "Fecha" },
		cell: ({ row }) => {
			const timestamp = row.getValue("timestamp") as string
			const date = new Date(timestamp)
			return (
				<div className="flex flex-col">
					<span className="text-sm">
						{date.toLocaleDateString("es-CL", {
							day: "2-digit",
							month: "2-digit",
							year: "numeric",
						})}
					</span>
					<span className="text-xs text-muted-foreground">
						{date.toLocaleTimeString("es-CL", {
							hour: "2-digit",
							minute: "2-digit",
							second: "2-digit",
						})}
					</span>
				</div>
			)
		},
	},
]
