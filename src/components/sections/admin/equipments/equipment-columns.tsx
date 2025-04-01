"use client"

import { ColumnDef } from "@tanstack/react-table"
import { FolderOpen } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import type { WorkEquipment } from "@/hooks/use-equipments"

export const EquipmentColumns: ColumnDef<WorkEquipment>[] = [
	{
		accessorKey: "tag",
		header: "TAG",
	},
	{
		accessorKey: "name",
		header: "Nombre",
	},
	{
		accessorKey: "type",
		header: "Tipo",
		cell: ({ row }) => {
			const type = row.getValue("type") as string | null
			return <span>{type || "N/A"}</span>
		},
	},
	{
		accessorKey: "location",
		header: "Ubicación",
	},
	{
		accessorKey: "description",
		header: "Descripción",
	},
	{
		accessorKey: "isOperational",
		header: "Operacional",
		cell: ({ row }) => {
			const isOperational = row.getValue("isOperational") as boolean
			return (
				<Badge
					variant={"outline"}
					className={cn("border-emerald-500 bg-emerald-500/10 text-emerald-500", {
						"border-red-500 bg-red-500/10 text-red-500": !isOperational,
					})}
				>
					{isOperational ? "Sí" : "No"}
				</Badge>
			)
		},
	},
	{
		id: "childrenCount",
		header: "Equipos Hijos",
		cell: ({ row }) => {
			const count = (row.original._count as { children: number }).children
			return (
				<div className="flex items-center gap-2">
					<span>{count}</span>
					{count > 0 && (
						<Link href={`/admin/dashboard/equipos?parentId=${row.original.id}`}>
							<Button size="icon" variant="ghost">
								<FolderOpen className="h-4 w-4" />
							</Button>
						</Link>
					)}
				</div>
			)
		},
	},
	{
		id: "workOrdersCount",
		header: "OTs",
		cell: ({ row }) => {
			const count = (row.original._count as { workOrders: number }).workOrders
			return <span>{count}</span>
		},
	},
	{
		accessorKey: "createdAt",
		header: "Fecha de Creación",
		cell: ({ row }) => {
			const date = row.getValue("createdAt") as Date
			return <span>{format(new Date(date), "yyyy-MM-dd")}</span>
		},
	},
]
