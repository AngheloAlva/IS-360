import { es } from "date-fns/locale"
import { format } from "date-fns"

import { Badge } from "@/shared/components/ui/badge"

import type { ColumnDef } from "@tanstack/react-table"

// Tipo para registros huérfanos
export interface OrphanedSafetyTalkRecord {
	rut: string
	name: string
	company: string
	fecha: string
	vencimiento: string | null
	estado: string
	status: string
	originalRowNumber: number
	originalData: {
		NOMBRE: string
		RUT: string
		EMPRESA: string
		FECHA: number
		Vencimiento?: number
		Estado: string
	}
}

const STATUS_COLORS = {
	"No Vigente": "bg-red-500/10 text-red-500",
	"Vigente": "bg-teal-500/10 text-teal-500",
}

const STATUS_LABELS = {
	"No Vigente": "No Vigente",
	"Vigente": "Vigente",
}

export const orphanedSafetyTalkColumns: ColumnDef<OrphanedSafetyTalkRecord>[] = [
	{
		accessorKey: "name",
		header: "Nombre",
		cell: ({ row }) => {
			const name = row.getValue("name") as string
			return <p className="font-medium">{name}</p>
		},
	},
	{
		accessorKey: "rut",
		header: "RUT",
		cell: ({ row }) => {
			const rut = row.getValue("rut") as string
			return <p className="font-mono text-sm">{rut}</p>
		},
	},
	{
		accessorKey: "company",
		header: "Empresa",
		cell: ({ row }) => {
			const company = row.getValue("company") as string
			return <p className="text-sm">{company}</p>
		},
	},
	{
		accessorKey: "estado",
		header: "Estado",
		cell: ({ row }) => {
			const status = row.getValue("estado") as keyof typeof STATUS_LABELS
			console.log(status)
			return <Badge className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>
		},
	},
	{
		accessorKey: "fecha",
		header: "Fecha",
		cell: ({ row }) => {
			const date = row.getValue("fecha") as string
			return date ? format(new Date(date), "dd/MM/yyyy", { locale: es }) : "-"
		},
	},
	{
		accessorKey: "vencimiento",
		header: "Vencimiento",
		cell: ({ row }) => {
			const date = row.getValue("vencimiento") as string | null
			return date ? format(new Date(date), "dd/MM/yyyy", { locale: es }) : "-"
		},
	},
]
