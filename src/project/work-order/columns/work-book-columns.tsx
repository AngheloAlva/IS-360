"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

import { WORK_ORDER_STATUS, type WORK_ORDER_TYPE } from "@/generated/prisma/enums"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"

import { Progress } from "@/shared/components/ui/progress"
import { Badge } from "@/shared/components/ui/badge"
import { DataGridColumnHeader } from "@/shared/components/data-grid/data-grid-column-header"

import type { WorkBookByCompany } from "@/project/work-order/hooks/use-work-books-by-company"
import UserHoverCard from "@/shared/components/data/UserHoverCard"

interface WorkBookColumnsProps {
	handleClick: (workOrder: WorkBookByCompany) => void
	tutorialMode?: boolean
}

export const getWorkBookColumns = ({
	handleClick,
	tutorialMode = false,
}: WorkBookColumnsProps): ColumnDef<WorkBookByCompany>[] => {
	return [
		{
			accessorKey: "otNumber",
			header: ({ column }) => <DataGridColumnHeader column={column} title="OT" visibility />,
			enableSorting: true,
			meta: {
				headerTitle: "OT",
			},
			cell: ({ row }) => {
				const otNumber = row.getValue("otNumber") as string

				return (
					<div
						onClick={() => handleClick(row.original)}
						className="hover:text-feature font-semibold text-orange-500 hover:underline"
					>
						{otNumber}
					</div>
				)
			},
		},
		{
			accessorKey: "supervisor.name",
			header: ({ column }) => (
				<DataGridColumnHeader column={column} title="Supervisor de obra" visibility />
			),
			enableSorting: true,
			meta: {
				headerTitle: "Supervisor de obra",
			},
		},
		{
			accessorKey: "responsible.name",
			header: ({ column }) => (
				<DataGridColumnHeader column={column} title="Responsable OTC" visibility />
			),
			enableSorting: true,
			meta: {
				headerTitle: "Responsable OTC",
			},
			cell: ({ row }) => {
				const responsible = row.original.responsible

				return <UserHoverCard {...responsible} />
			},
		},
		{
			accessorKey: "workBookName",
			header: ({ column }) => (
				<DataGridColumnHeader column={column} title="Nombre de obra" visibility />
			),
			enableSorting: true,
			meta: {
				headerTitle: "Nombre de obra",
			},
			cell: ({ row }) => {
				const workBookName = row.getValue("workBookName") as string | null
				const isMissingWorkBook = !workBookName
				return (
					<div
						onClick={() => isMissingWorkBook && handleClick(row.original)}
						data-tutorial-id={
							tutorialMode && isMissingWorkBook ? "work-book-missing-name" : undefined
						}
						className={cn({
							"font-semibold text-red-500": isMissingWorkBook,
							"cursor-pointer hover:underline": isMissingWorkBook,
						})}
					>
						{workBookName || "Libro de obras no creado"}
					</div>
				)
			},
		},
		{
			accessorKey: "workBookStartDate",
			header: ({ column }) => (
				<DataGridColumnHeader column={column} title="Fecha de inicio" visibility />
			),
			enableSorting: true,
			meta: {
				headerTitle: "Fecha de inicio",
			},
			cell: ({ row }) => {
				const date = row.getValue("workBookStartDate") as Date | null
				const formattedDate = date ? format(date, "dd/MM/yyyy") : "No iniciada"
				return <div>{formattedDate}</div>
			},
		},
		{
			accessorKey: "estimatedEndDate",
			header: ({ column }) => (
				<DataGridColumnHeader column={column} title="Fecha termino" visibility />
			),
			enableSorting: true,
			meta: {
				headerTitle: "Fecha termino",
			},
			cell: ({ row }) => {
				const date = row.getValue("estimatedEndDate") as Date | null
				const formattedDate = date ? format(date, "dd/MM/yyyy") : ""
				return <div>{formattedDate}</div>
			},
		},
		{
			accessorKey: "rescheduledEndDate",
			header: ({ column }) => (
				<DataGridColumnHeader column={column} title="Fecha reprogramada" visibility />
			),
			enableSorting: true,
			meta: {
				headerTitle: "Fecha reprogramada",
			},
			cell: ({ row }) => {
				const date = row.getValue("rescheduledEndDate") as Date | null
				if (!date) return <span className="text-muted-foreground">—</span>
				return <span className="font-semibold text-amber-600">{format(date, "dd/MM/yyyy")}</span>
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
				const status = row.getValue("status") as WORK_ORDER_STATUS
				return (
					<Badge
						className={cn("border-slate-500 bg-slate-500/10 text-slate-500", {
							"border-purple-500 bg-purple-500/10 text-purple-500":
								status === WORK_ORDER_STATUS.IN_PROGRESS,
							"border-cyan-500 bg-cyan-500/10 text-cyan-500":
								status === WORK_ORDER_STATUS.CLOSURE_REQUESTED,
							"border-yellow-500 bg-yellow-500/10 text-yellow-500":
								status === WORK_ORDER_STATUS.PENDING,
							"border-green-500 bg-green-500/10 text-green-500":
								status === WORK_ORDER_STATUS.COMPLETED,
							"border-red-500 bg-red-500/10 text-red-500": status === WORK_ORDER_STATUS.CANCELLED,
						})}
					>
						{WorkOrderStatusLabels[status]}
					</Badge>
				)
			},
		},
		{
			accessorKey: "progress",
			header: ({ column }) => <DataGridColumnHeader column={column} title="Avance" visibility />,
			enableSorting: true,
			meta: {
				headerTitle: "Avance",
			},
			cell: ({ row }) => {
				const status = row.getValue("progress") as number
				return <Progress value={status} className="h-1.5 [&>div]:bg-orange-500" />
			},
		},
		{
			accessorKey: "equipments",
			header: ({ column }) => <DataGridColumnHeader column={column} title="Equipos" visibility />,
			enableSorting: false,
			meta: {
				headerTitle: "Equipos",
			},
			cell: ({ row }) => {
				const equipments = row.original.equipments
				return (
					<ul>
						{equipments.map((e) => (
							<li key={e.name}>{e.name}</li>
						))}
					</ul>
				)
			},
		},
		{
			accessorKey: "workBookLocation",
			header: ({ column }) => <DataGridColumnHeader column={column} title="Ubicacion" visibility />,
			enableSorting: true,
			meta: {
				headerTitle: "Ubicacion",
			},
		},
		{
			accessorKey: "type",
			header: ({ column }) => (
				<DataGridColumnHeader column={column} title="Tipo de obra" visibility />
			),
			enableSorting: true,
			meta: {
				headerTitle: "Tipo de obra",
			},
			cell: ({ row }) => {
				const type = row.getValue("type") as WORK_ORDER_TYPE
				return <div>{WorkOrderTypeLabels[type]}</div>
			},
		},
	]
}
