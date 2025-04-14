import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import type { SafetyTalk } from "@/hooks/use-safety-talks"

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
				<Badge variant={isPresential ? "default" : "secondary"}>
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
]
