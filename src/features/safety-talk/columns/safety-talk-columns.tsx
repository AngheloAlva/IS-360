import { ArrowUpDown, Edit } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import { cn } from "@/lib/utils"

import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"

import type { SafetyTalk } from "@/features/safety-talk/hooks/use-safety-talks"
import type { ColumnDef } from "@tanstack/react-table"

export const SafetyTalkColumns: ColumnDef<SafetyTalk>[] = [
	{
		accessorKey: "title",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Título
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row }) => {
			const title: string = row.getValue("title")
			const slug: string = row.original.slug

			return (
				<Link
					href={`/admin/dashboard/charlas-de-seguridad/${slug}`}
					className="text-primary font-medium hover:underline"
				>
					{title}
				</Link>
			)
		},
	},
	{
		accessorKey: "isPresential",
		header: "Modalidad",
		cell: ({ row }) => {
			const isPresential: boolean = row.getValue("isPresential")
			return (
				<Badge
					className={cn({
						"bg-green-500/10 text-green-500": isPresential,
						"bg-purple-500/10 text-purple-500": !isPresential,
					})}
				>
					{isPresential ? "Presencial" : "Online"}
				</Badge>
			)
		},
	},
	{
		accessorKey: "_count.questions",
		header: "Preguntas",
		cell: ({ row }) => {
			const count = row.original._count.questions
			return count
		},
	},
	{
		accessorKey: "_count.resources",
		header: "Recursos",
		cell: ({ row }) => {
			const count = row.original._count.resources
			return count
		},
	},
	{
		accessorKey: "_count.userSafetyTalks",
		header: "Completadas",
		cell: ({ row }) => {
			const count = row.original._count.userSafetyTalks
			return count
		},
	},
	{
		accessorKey: "expiresAt",
		header: "Vence",
		cell: ({ row }) => {
			const date = new Date(row.getValue("expiresAt"))
			return format(date, "dd 'de' MMMM, yyyy", { locale: es })
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const slug = row.original.slug
			return (
				<div className="flex items-center justify-center gap-2">
					<Link
						href={`/admin/dashboard/charlas-de-seguridad/${slug}/editar`}
						className="text-blue-500 hover:text-blue-700"
					>
						<Edit className="h-4 w-4" />
					</Link>
					{/* Implementar lógica de eliminación aquí si es necesario */}
				</div>
			)
		},
		header: "Acciones",
	},
]
