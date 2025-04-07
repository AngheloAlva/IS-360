"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { toast } from "sonner"

import { getWorkBooksByCompanyIdLikeBook } from "@/actions/work-orders/getWorkBooks"
import { cn } from "@/lib/utils"

import { WorkBookDataTable } from "./WorkBookDataTable"
import { workBookColumns } from "./work-book-columns"
import { useSidebar } from "@/components/ui/sidebar"

import type { WorkOrder } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function WorkBookMain({
	page,
	companyId,
}: {
	page: number
	companyId: string
}): React.ReactElement {
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [workBooks, setWorkBooks] = useState<WorkOrder[]>([])

	const { state } = useSidebar()

	useEffect(() => {
		const fetchWorkBooks = async () => {
			const data = await getWorkBooksByCompanyIdLikeBook(companyId, 10, page)

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
	}, [page, companyId])

	return (
		<main
			className={cn(
				"flex h-full w-full flex-col gap-8 transition-all md:max-w-[95dvw] lg:max-w-[96dvw]",
				{
					"md:max-w-[62dvw] lg:max-w-[70dvw] xl:max-w-[77dvw] 2xl:max-w-[80dvw]":
						state === "expanded",
				}
			)}
		>
			<div className="flex w-full flex-wrap items-center justify-between gap-2">
				<div>
					<h1 className="text-text w-fit text-3xl font-bold">Libro de Obras</h1>
					<p className="text-text-foreground">
						Aca puedes gestionar tus libros de obras y sus actividades.
					</p>
				</div>

				<Link href="/dashboard/libro-de-obras/agregar" className="md:ml-auto">
					<Button
						size={"lg"}
						className="border-primary text-primary border bg-white hover:text-white"
					>
						<Plus />
						Agregar Obra
					</Button>
				</Link>
			</div>

			<WorkBookDataTable columns={workBookColumns} data={workBooks} isLoading={isLoading} />
		</main>
	)
}
