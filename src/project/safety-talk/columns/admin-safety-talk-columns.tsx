import { es } from "date-fns/locale"
import { format } from "date-fns"

import { DownloadCertificateButton } from "../components/DownloadCertificateButton"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/lib/utils"

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
	VISITOR: "bg-emerald-500/10 text-emerald-500",
	VISITOR_TRM: "bg-emerald-500/10 text-emerald-500",
	IRL: "bg-blue-500/10 text-blue-500",
}

const CATEGORY_LABELS = {
	VISITOR: "Visitas - Hualpén",
	VISITOR_TRM: "Visitas - El Avellano",
	IRL: "IRL",
}

export const adminSafetyTalkColumns: ColumnDef<ApiSafetyTalk>[] = [
	{
		id: "actions",
		header: "",
		cell: ({ row }) => {
			const talk = row.original
			const status = talk.status
			const expiresAt = talk.expiresAt ? new Date(talk.expiresAt) : null
			const isExpired = expiresAt ? expiresAt < new Date() : false
			const canDownload =
				(status === "PASSED" || status === "MANUALLY_APPROVED") && !isExpired && !talk.isExternal

			const userData = talk.isExternal ? talk.externalVisitor : talk.user

			return (
				<DownloadCertificateButton
					userSafetyTalkId={talk.id}
					userName={userData?.name || ""}
					category={talk.category}
					canDownload={canDownload}
				/>
			)
		},
	},
	{
		accessorKey: "user",
		header: "Usuario",
		cell: ({ row }) => {
			const isExternal = row.original.isExternal
			const userData = isExternal ? row.original.externalVisitor : row.original.user

			if (!userData) return <p className="text-muted-foreground">-</p>

			return (
				<div>
					<p className="font-semibold">{userData.name}</p>
					<p className="text-muted-foreground text-sm">{userData.email}</p>
				</div>
			)
		},
	},
	{
		accessorKey: "company",
		header: "Empresa",
		cell: ({ row }) => {
			const isExternal = row.original.isExternal
			const userData = isExternal ? row.original.externalVisitor : row.original.user
			const company = userData?.company
			return <p className="max-w-52 min-w-52 font-semibold text-wrap">{company?.name || "-"}</p>
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
			return score ? `${score.toFixed(0)}/100` : "-"
		},
	},
	{
		accessorKey: "currentAttempts",
		header: "Intentos",
	},
	{
		accessorKey: "lastAttemptAt",
		header: "Último intento",
		cell: ({ row }) => {
			const date = row.getValue("lastAttemptAt") as string | null
			return date ? format(new Date(date), "dd 'de' MMMM, yyyy", { locale: es }) : "-"
		},
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
			return (
				<p className={cn({ "text-red-500": date && new Date(date) < new Date() })}>
					{date ? format(new Date(date), "dd 'de' MMMM, yyyy", { locale: es }) : "-"}
				</p>
			)
		},
	},
]
