import { ChevronLeft, Plus } from "lucide-react"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import Link from "next/link"

import { getWorkBook } from "@/actions/work-books/getWorkBook"
import { cn } from "@/lib/utils"

import WorkBookEntriesTable from "@/components/work-book/WorkBookEntriesTable"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function AdminWorkBooksPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	const workBook = await getWorkBook(id)

	if (!workBook || !workBook.data) {
		return notFound()
	}

	return (
		<>
			<div className="mt-2 flex w-full items-center justify-between">
				<div className="flex items-start justify-start gap-1">
					<Link
						href="/dashboard/admin/libros-de-obras"
						className="hover:bg-primary/40 hover:text-primary mt-1 -ml-7 rounded-full transition-colors"
					>
						<ChevronLeft />
					</Link>

					<h1 className="flex flex-col text-2xl font-bold">
						{workBook.data.workName}
						<span className="text-feature text-base font-medium">
							{workBook.data.otNumber.otNumber}
						</span>
					</h1>
				</div>

				<div className="flex flex-wrap gap-2">
					<Badge
						className={cn("text-sm", {
							"bg-green-500": workBook.data.workStatus === "ejecucion",
							"bg-yellow-500": workBook.data.workStatus === "planificado",
							"bg-red-500": workBook.data.workStatus === "finalizado",
						})}
					>
						<b>Estado:</b> {workBook.data.workStatus}
					</Badge>

					<Badge
						className={cn("text-sm", {
							"bg-green-500": workBook.data.workProgressStatus === "terminado",
							"bg-yellow-500": workBook.data.workProgressStatus === "proceso",
							"bg-red-500": workBook.data.workProgressStatus === "pendiente",
						})}
					>
						<b>Progreso:</b> {workBook.data.workProgressStatus}
					</Badge>
				</div>
			</div>

			<ul className="text-muted-foreground flex w-full flex-col items-start gap-1">
				<li>
					<b>Tipo de Trabajo:</b> <span className="capitalize">{workBook.data.workType}</span>
				</li>
				<li>
					<b>Contratista:</b> {workBook.data.contractingCompany}
				</li>
				<li>
					<b>Fecha de Inicio:</b> {format(workBook.data.workStartDate, "dd/MM/yyyy")}
				</li>
				<li>
					<b>Fecha de Término:</b> {format(workBook.data.workEstimatedEndDate, "dd/MM/yyyy")}
				</li>
				<li>
					<b>Ubicación:</b> {workBook.data.workLocation}
				</li>
				<li>
					<b>Responsable:</b> {workBook.data.workResponsibleName} -{" "}
					{workBook.data.workResponsiblePhone}
				</li>
				<li>
					<b>Inspector OTC:</b> {workBook.data.otcInspectorName} - {workBook.data.otcInspectorPhone}
				</li>
			</ul>

			<Separator />

			<div className="flex w-full items-center justify-end gap-2">
				<Link href={`/dashboard/libro-de-obras/${id}/actividades-diarias`}>
					<Button size={"lg"} className="bg-blue-500 hover:bg-blue-600">
						<span className="hidden lg:block">Actividad Diaria</span>
						<Plus />
					</Button>
				</Link>
				<Link href={`/dashboard/libro-de-obras/${id}/actividades-adicionales`}>
					<Button size={"lg"} className="bg-cyan-500 hover:bg-cyan-600">
						<span className="hidden lg:block">Actividad Adicional</span>
						<Plus />
					</Button>
				</Link>
				<Link href={`/dashboard/admin/libros-de-obras/${id}/inspeccion-otc`}>
					<Button size={"lg"} className="bg-purple-500 hover:bg-purple-600">
						<span className="hidden lg:block">Inspección OTC</span>
						<Plus />
					</Button>
				</Link>
				<Link href={`/dashboard/libro-de-obras/${id}/prevencion`}>
					<Button size={"lg"} className="bg-emerald-500 hover:bg-emerald-600">
						<span className="hidden lg:block">Área de Prevención</span>
						<Plus />
					</Button>
				</Link>
			</div>

			<WorkBookEntriesTable entries={workBook.data.entries} />
		</>
	)
}
