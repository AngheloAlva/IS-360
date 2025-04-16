import { ColumnDef } from "@tanstack/react-table"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import type { StarterBook } from "@/hooks/use-starter-books"

export const StarterBookColumns: ColumnDef<StarterBook>[] = [
	{
		accessorKey: "company",
		header: "Modalidad",
		cell: ({ row }) => {
			const company = row.original.company as { name: string; id: string }

			return company.name
		},
	},
	{
		accessorKey: "createdAt",
		header: "Creado el",
		cell: ({ row }) => {
			const date = new Date(row.getValue("createdAt"))
			return format(date, "dd 'de' MMMM, yyyy", { locale: es })
		},
	},
]
