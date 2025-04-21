"use client"

import { Plus } from "lucide-react"
import Link from "next/link"

import { WorkBookDataTable } from "./WorkBookDataTable"
import { Button } from "@/components/ui/button"

export default function WorkBookMain({ companyId }: { companyId: string }): React.ReactElement {
	return (
		<main className="flex h-full w-full flex-1 flex-col gap-8 transition-all">
			<div className="flex w-full flex-wrap items-center justify-between gap-2">
				<div>
					<h1 className="text-text w-fit text-3xl font-bold">Libro de Obras</h1>
					<p className="text-text-foreground">
						Aca puedes gestionar tus libros de obras y sus actividades.
					</p>
				</div>

				<Link href="/dashboard/libro-de-obras/agregar" className="md:ml-auto">
					<Button size={"lg"}>
						<Plus />
						Agregar Obra
					</Button>
				</Link>
			</div>

			<WorkBookDataTable companyId={companyId} />
		</main>
	)
}
