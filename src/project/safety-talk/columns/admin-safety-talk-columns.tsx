import { es } from "date-fns/locale"
import { format } from "date-fns"

import { Badge } from "@/shared/components/ui/badge"

import type { ApiSafetyTalk } from "../types/api-safety-talk"
import type { ColumnDef } from "@tanstack/react-table"

const STATUS_COLORS = {
	PENDING: "bg-amber-500/10 text-amber-500",
	PASSED: "bg-blue-500/10 text-blue-500",
	FAILED: "bg-red-500/10 text-red-500",
	MANUALLY_APPROVED: "bg-emerald-500/10 text-emerald-500",
	EXPIRED: "bg-gray-500/10 text-gray-500",
}

const STATUS_LABELS = {
	PENDING: "Pendiente",
	PASSED: "Aprobado",
	FAILED: "Reprobado",
	MANUALLY_APPROVED: "Aprobado Manual",
	EXPIRED: "Expirado",
}

const CATEGORY_COLORS = {
	ENVIRONMENTAL: "bg-emerald-500/10 text-emerald-500",
	IRL: "bg-blue-500/10 text-blue-500",
}

const CATEGORY_LABELS = {
	ENVIRONMENTAL: "Medio Ambiente",
	IRL: "IRL",
}

export const adminSafetyTalkColumns: ColumnDef<ApiSafetyTalk>[] = [
	{
		accessorKey: "user",
		header: "Usuario",
		cell: ({ row }) => {
			const user = row.original.user

			return (
				<div>
					<p className="font-medium">{user.name}</p>
					<p className="text-muted-foreground text-sm">{user.email}</p>
				</div>
			)
		},
	},
	{
		accessorKey: "company",
		header: "Empresa",
		cell: ({ row }) => {
			const company = row.original.user.company
			return <p className="font-medium">{company.name}</p>
		},
	},
	{
		accessorKey: "category",
		header: "Categoría",
		cell: ({ row }) => {
			const category = row.getValue("category") as keyof typeof CATEGORY_LABELS
			return <Badge className={CATEGORY_COLORS[category]}>{CATEGORY_LABELS[category]}</Badge>
		},
	},
	{
		accessorKey: "status",
		header: "Estado",
		cell: ({ row }) => {
			const status = row.getValue("status") as keyof typeof STATUS_LABELS
			return <Badge className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>
		},
	},
	{
		accessorKey: "score",
		header: "Puntuación",
		cell: ({ row }) => {
			const score = row.getValue("score") as number | null
			return score ? `${score}/100` : "-"
		},
	},
	{
		accessorKey: "currentAttempts",
		header: "Intentos",
	},
	{
		accessorKey: "completedAt",
		header: "Completado",
		cell: ({ row }) => {
			const date = row.original.completedAt as string | null
			return date ? format(new Date(date), "dd 'de' MMMM, yyyy", { locale: es }) : "-"
		},
	},
	{
		accessorKey: "expiresAt",
		header: "Vence",
		cell: ({ row }) => {
			const date = row.getValue("expiresAt") as string | null
			return date ? format(new Date(date), "dd 'de' MMMM, yyyy", { locale: es }) : "-"
		},
	},
]
