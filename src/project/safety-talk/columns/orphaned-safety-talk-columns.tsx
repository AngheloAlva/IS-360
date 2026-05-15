import { es } from "date-fns/locale"
import { format } from "date-fns"

import { Badge } from "@/shared/components/ui/badge"

import type { ColumnDef } from "@tanstack/react-table"

// Tipo para registros de charlas presenciales
export interface OrphanedSafetyTalkRecord {
	id: string
	rut: string
	name: string
	company: string
	category: string | null
	fecha: string
	vencimiento: string | null
	estado: string
	status: string
	score: number | null
	source: string
	notes: string | null
	createdAt: string
	updatedAt: string
}

const STATUS_COLORS = {
	"No Vigente": "bg-red-500/10 text-red-500",
	"Vigente": "bg-teal-500/10 text-teal-500",
}

const STATUS_LABELS = {
	"No Vigente": "No Vigente",
	"Vigente": "Vigente",
}

const CATEGORY_LABELS: Record<string, string> = {
	IRL: "IRL",
	VISITOR_TRM: "Visita TRM",
	VISITOR: "Visita PRS",
	ENVIRONMENT: "Medio Ambiente",
}

const SOURCE_COLORS = {
	IMPORT: "bg-blue-500/10 text-blue-500",
	MANUAL: "bg-purple-500/10 text-purple-500",
}

const SOURCE_LABELS = {
	IMPORT: "Importado",
	MANUAL: "Manual",
}

export const orphanedSafetyTalkColumns: ColumnDef<OrphanedSafetyTalkRecord>[] = [
	{
		accessorKey: "name",
		header: "Nombre",
		cell: ({ row }) => {
			const name = row.getValue("name") as string
			return <p className="font-semibold">{name}</p>
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
		accessorKey: "category",
		header: "Tipo",
		cell: ({ row }) => {
			const category = row.getValue("category") as string | null
			if (!category) return <p className="text-muted-foreground text-sm">-</p>
			return <p className="text-sm">{CATEGORY_LABELS[category] || category}</p>
		},
	},
	{
		accessorKey: "estado",
		header: "Estado",
		cell: ({ row }) => {
			const status = row.getValue("estado") as keyof typeof STATUS_LABELS
			return <Badge className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>
		},
	},
	{
		accessorKey: "score",
		header: "Puntaje",
		cell: ({ row }) => {
			const score = row.getValue("score") as number | null
			return score !== null ? <p className="text-sm">{score}%</p> : <p className="text-muted-foreground text-sm">-</p>
		},
	},
	{
		accessorKey: "source",
		header: "Origen",
		cell: ({ row }) => {
			const source = row.getValue("source") as keyof typeof SOURCE_LABELS
			return (
				<Badge className={SOURCE_COLORS[source] || "bg-gray-500/10 text-gray-500"}>
					{SOURCE_LABELS[source] || source}
				</Badge>
			)
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
