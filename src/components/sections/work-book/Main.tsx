"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"

import { getWorkBooks } from "@/actions/work-books/getWorkBook"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import { DataTable } from "./DataTable"
import { columns } from "./columns"

import type { WorkBook } from "@prisma/client"

export default function MainWorkBook({
	page,
	userId,
}: {
	page: number
	userId: string
}): React.ReactElement {
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [workBooks, setWorkBooks] = useState<WorkBook[]>([])
	const { state } = useSidebar()

	useEffect(() => {
		const fetchWorkBooks = async () => {
			const data = await getWorkBooks(userId, 10, page)

			if (!data.ok || !data.data) {
				toast("Error al cargar los libros de obras", {
					description: data.message,
					duration: 5000,
				})
				return notFound()
			}

			setWorkBooks(data.data)
			setIsLoading(false)
		}

		void fetchWorkBooks()
	}, [page, userId])

	return (
		<main
			className={cn(
				"flex h-full w-full flex-col gap-8 overflow-hidden transition-all md:max-w-[95dvw] lg:max-w-[96dvw]",
				{
					"md:max-w-[68dvw] lg:max-w-[75dvw] xl:max-w-[80dvw]": state === "expanded",
				}
			)}
		>
			<h1 className="w-fit text-3xl font-bold">Libro de Obras</h1>

			<DataTable columns={columns} data={workBooks} isLoading={isLoading} />
		</main>
	)
}
