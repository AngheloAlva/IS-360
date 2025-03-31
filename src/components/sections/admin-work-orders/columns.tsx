"use client"

import { ColumnDef } from "@tanstack/react-table"
import { LinkIcon } from "lucide-react"
import { format } from "date-fns"

import { WORK_ORDER_PRIORITY_VALUES } from "@/lib/consts/work-order-priority"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"

import type { Company, User, WorkOrder } from "@prisma/client"

export const columns: ColumnDef<
	WorkOrder & {
		responsible?: { name: string }
		supervisor?: { name: string; company: { name: string } }
		equipment?: { name: string }[]
	}
>[] = [
	{
		accessorKey: "otNumber",
		header: "Numero de OT",
	},
	{
		accessorKey: "solicitationDate",
		header: "Fecha de Solicitud",
		cell: ({ row }) => {
			const date = row.getValue("solicitationDate") as Date
			return <span>{format(new Date(date), "yyyy-MM-dd")}</span>
		},
	},
	{
		accessorKey: "type",
		header: "Tipo de Trabajo",
	},
	{
		accessorKey: "status",
		header: "Estado",
		cell: ({ row }) => {
			const status = row.getValue("status") as string
			return <Badge variant={"outline"}>{status}</Badge>
		},
	},
	{
		accessorKey: "solicitationTime",
		header: "Hora de Solicitud",
	},
	{
		accessorKey: "workRequest",
		header: "Trabajo Solicitado",
	},
	{
		accessorKey: "workDescription",
		header: "Descripción del Trabajo",
	},
	{
		accessorKey: "priority",
		header: "Prioridad",
		cell: ({ row }) => {
			const priority = row.getValue("priority") as WorkOrder["priority"]
			return (
				<Badge
					className={cn({
						"bg-primary/10 border-primary text-primary": priority === "HIGH",
						"border-yellow-500 bg-yellow-500/10 text-yellow-500": priority === "MEDIUM",
						"border-red-500 bg-red-500/10 text-red-500": priority === "LOW",
					})}
				>
					{WORK_ORDER_PRIORITY_VALUES[priority]}
				</Badge>
			)
		},
	},
	{
		accessorKey: "equipment",
		header: "Equipo",
		cell: ({ row }) => {
			const equipment = row.getValue("equipment") as { name: string }[]
			return <span>{equipment?.map((eq) => eq.name).join(", ")}</span>
		},
	},
	{
		accessorKey: "programDate",
		header: "Fecha Programada",
		cell: ({ row }) => {
			const date = row.getValue("programDate") as Date
			return <span>{format(new Date(date), "yyyy-MM-dd")}</span>
		},
	},
	{
		accessorKey: "estimatedHours",
		header: "Horas Estimadas",
	},
	{
		accessorKey: "estimatedDays",
		header: "Días Estimados",
	},
	{
		accessorKey: "requiresBreak",
		header: "Requiere Dias de Paro",
		cell: ({ row }) => {
			const requiresBreak = row.getValue("requiresBreak") as boolean
			return <span>{requiresBreak ? "Sí" : "No"}</span>
		},
	},
	{
		accessorKey: "estimatedEndDate",
		header: "Fecha de Finalización",
		cell: ({ row }) => {
			const date = row.getValue("estimatedEndDate") as Date
			return <span>{format(new Date(date), "yyyy-MM-dd")}</span>
		},
	},
	{
		accessorKey: "responsible",
		header: "Responsable",
		cell: ({ row }) => {
			const responsible = row.getValue("responsible") as User
			return <span>{responsible?.name}</span>
		},
	},
	{
		accessorKey: "supervisor",
		header: "Supervisor",
		cell: ({ row }) => {
			const supervisor = row.getValue("supervisor") as User
			return <span>{supervisor?.name}</span>
		},
	},
	{
		accessorKey: "company",
		header: "Empresa",
		cell: ({ row }) => {
			const company = row.getValue("company") as Company
			return <span>{company?.name}</span>
		},
	},
	{
		accessorKey: "initReport",
		header: "Reporte Inicial",
		cell: () => {
			// const initReport = row.getValue("initReport") as Attachment
			return <LinkIcon className="hover:text-primary h-4 w-4" />
		},
	},
	{
		accessorKey: "endReport",
		header: "Reporte Final",
		cell: () => {
			// const endReport = row.getValue("endReport") as Attachment
			return <LinkIcon className="hover:text-primary h-4 w-4" />
		},
	},
]
