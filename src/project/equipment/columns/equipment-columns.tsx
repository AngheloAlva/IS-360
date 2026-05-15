"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ChevronRight, EyeIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import EquipmentDetailsDialog from "@/project/equipment/components/dialogs/EquipmentDetailsDialog"
import EquipmentAttachmentLink from "@/project/equipment/components/data/EquipmentAttachmentLink"
import { EquipmentDragHandle } from "@/project/equipment/components/data/EquipmentTreeDndProvider"
import { DataGridColumnHeader } from "@/shared/components/data-grid/data-grid-column-header"
import EditEquipmentForm from "@/project/equipment/components/forms/EditEquipmentForm"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"

import type { WorkEquipment } from "@/project/equipment/hooks/use-equipments"

const dragHandleColumn: ColumnDef<WorkEquipment> = {
	id: "drag",
	size: 30,
	enableSorting: false,
	enableResizing: false,
	header: "",
	cell: () => <EquipmentDragHandle />,
}

const expanderColumn: ColumnDef<WorkEquipment> = {
	id: "expander",
	size: 40,
	enableSorting: false,
	enableResizing: false,
	header: "",
	cell: ({ row }) => {
		const hasChildren = row.original._count.children > 0
		if (!hasChildren) return null
		return (
			<button
				onClick={row.getToggleExpandedHandler()}
				className="flex items-center justify-center"
			>
				<ChevronRight
					className={cn("size-4 transition-transform duration-200", {
						"rotate-90": row.getIsExpanded(),
					})}
				/>
			</button>
		)
	},
}

export const getEquipmentColumns = ({
	equipments,
	onNavigateToHistory,
	mode = "flat",
}: {
	equipments: WorkEquipment[]
	onNavigateToHistory: (equipmentId: string) => void
	mode?: "tree" | "flat"
}): ColumnDef<WorkEquipment>[] => {
	const baseColumns: ColumnDef<WorkEquipment>[] = [
		{
			accessorKey: "id",
			header: "",
			enableSorting: false,
			meta: {
				headerTitle: "Detalle",
			},
			size: 45,
			enableResizing: false,
			cell: ({ row }) => {
				const equipment = row.original
				return (
					<EquipmentDetailsDialog equipment={equipment}>
						<Button
							size="icon"
							variant="ghost"
							className="size-8 cursor-pointer text-left font-semibold text-teal-600 hover:bg-teal-600 hover:text-white"
						>
							<EyeIcon className="size-4" />
						</Button>
					</EquipmentDetailsDialog>
				)
			},
		},
		{
			accessorKey: "tag",
			header: ({ column }) => <DataGridColumnHeader column={column} title="TAG" visibility />,
			meta: {
				headerTitle: "TAG",
			},
			size: 100,
		},
		{
			accessorKey: "name",
			header: ({ column }) => (
				<DataGridColumnHeader column={column} title="Nombre del Equipo" visibility />
			),
			size: 180,
			meta: {
				headerTitle: "Nombre del Equipo",
			},
			cell: ({ row }) => (
				<button
					onClick={() => onNavigateToHistory(row.original.id)}
					className="font-semibold text-emerald-600 hover:cursor-pointer hover:underline"
				>
					{row.original.name}
				</button>
			),
		},
		{
			accessorKey: "type",
			header: ({ column }) => (
				<DataGridColumnHeader column={column} title="Tipo de Equipo" visibility />
			),
			meta: {
				headerTitle: "Tipo de Equipo",
			},
			cell: ({ row }) => {
				const type = row.getValue("type") as string | null
				return <span>{type || "N/A"}</span>
			},
		},
		{
			id: "location",
			accessorFn: (row) => row.location?.path ?? "",
			header: ({ column }) => (
				<DataGridColumnHeader column={column} title="Ubicacion del Equipo" visibility />
			),
			meta: {
				headerTitle: "Ubicacion del Equipo",
			},
			size: 200,
		},
		{
			accessorKey: "description",
			header: ({ column }) => (
				<DataGridColumnHeader column={column} title="Descripcion" visibility />
			),
			enableSorting: false,
			meta: {
				headerTitle: "Descripcion",
			},
		},
		{
			accessorKey: "isOperational",
			header: ({ column }) => (
				<DataGridColumnHeader column={column} title="Operacional" visibility />
			),
			meta: {
				headerTitle: "Operacional",
			},
			cell: ({ row }) => {
				const isOperational = row.getValue("isOperational") as boolean
				return (
					<Badge
						variant="outline"
						className={cn("border-emerald-500 bg-emerald-500/10 text-emerald-500", {
							"border-red-500 bg-red-500/10 text-red-500": !isOperational,
						})}
					>
						{isOperational ? "Si" : "No"}
					</Badge>
				)
			},
		},
		{
			id: "childrenCount",
			header: ({ column }) => (
				<DataGridColumnHeader column={column} title="Equipos Hijos" visibility />
			),
			enableSorting: false,
			meta: {
				headerTitle: "Equipos Hijos",
			},
			cell: ({ row }) => {
				const count = (row.original._count as { children: number }).children
				return <span>{count}</span>
			},
		},
		{
			id: "workOrdersCount",
			header: ({ column }) => (
				<DataGridColumnHeader column={column} title="OTs Asignadas" visibility />
			),
			enableSorting: false,
			meta: {
				headerTitle: "OTs Asignadas",
			},
			cell: ({ row }) => {
				const count = (row.original._count as { workOrders: number }).workOrders
				return <span>{count}</span>
			},
		},
		{
			id: "attachmentsCount",
			header: ({ column }) => (
				<DataGridColumnHeader column={column} title="Archivos" visibility />
			),
			enableSorting: false,
			meta: {
				headerTitle: "Archivos",
			},
			cell: ({ row }) => {
				const attachments = row.original.attachments

				return (
					<ul className="flex flex-col gap-1">
						{attachments.length > 0 ? (
							attachments.map((attachment) => (
								<li key={attachment.id}>
									<EquipmentAttachmentLink url={attachment.url} name={attachment.name} />
								</li>
							))
						) : (
							<li>Sin archivos</li>
						)}
					</ul>
				)
			},
		},
		{
			id: "actions",
			header: ({ column }) => (
				<DataGridColumnHeader column={column} title="Acciones" visibility />
			),
			enableSorting: false,
			meta: {
				headerTitle: "Acciones",
			},
			cell: ({ row }) => (
				<div className="flex items-center justify-center space-x-2">
					<EditEquipmentForm id={row.original.id} equipments={equipments} />
				</div>
			),
		},
	]

	if (mode === "tree") {
		return [dragHandleColumn, expanderColumn, ...baseColumns]
	}

	return baseColumns
}
