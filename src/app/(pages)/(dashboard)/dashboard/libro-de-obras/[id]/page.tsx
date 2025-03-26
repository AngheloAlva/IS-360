import { ChevronLeft, Plus } from "lucide-react"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import Link from "next/link"

import { getWorkOrderById } from "@/actions/work-orders/getWorkOrders"
import { cn } from "@/lib/utils"

import WorkBookEntriesTable from "@/components/work-book/WorkBookEntriesTable"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WorkOrderType } from "@/lib/consts/work-order-types"
import { Progress } from "@/components/ui/progress"

export default async function WorkBooksPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	const { data } = await getWorkOrderById(id)

	if (!data) {
		return notFound()
	}

	return (
		<>
			<div className="mt-2 flex w-full items-center justify-between">
				<div className="flex items-start justify-start gap-1">
					<Link
						href="/dashboard/libro-de-obras"
						className="hover:bg-primary/40 hover:text-primary mt-1 -ml-7 rounded-full transition-colors"
					>
						<ChevronLeft />
					</Link>

					<h1 className="flex flex-col text-2xl font-bold">
						{data.workName}
						<span className="text-feature text-base font-medium">{data.otNumber}</span>
					</h1>
				</div>

				<div className="flex flex-wrap gap-2">
					<Badge
						className={cn("text-sm", {
							"bg-emerald-500": data.status === "EXPIRED",
							"bg-purple-500": data.status === "PENDING",
							"bg-yellow-500": data.status === "IN_PROGRESS",
							"bg-red-500": data.status === "CANCELLED",
						})}
					>
						<b>Estado:</b> {data.status}
					</Badge>

					<Progress className="w-1/2" value={data.workProgressStatus} />
				</div>
			</div>

			<ul className="text-muted-foreground flex w-full flex-col items-start gap-1">
				<li>
					<b>Tipo de Trabajo:</b> <span className="capitalize">{WorkOrderType[data.type]}</span>
				</li>
				<li>
					<b>Contratista:</b> {data.company.name} - {data.company.rut}
				</li>
				<li>
					<b>Fecha de Inicio:</b> {data.workStartDate && format(data.workStartDate, "dd/MM/yyyy")}
				</li>
				<li>
					<b>Fecha de Término:</b>{" "}
					{data.estimatedEndDate && format(data.estimatedEndDate, "dd/MM/yyyy")}
				</li>
				<li>
					<b>Ubicación:</b> {data.workLocation}
				</li>
				<li>
					<b>Responsable:</b> {data.supervisor.name} - {data.supervisor.phone}
				</li>
				<li>
					<b>Inspector OTC:</b> {data.responsible.name} - {data.responsible.phone}
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
				<Link href={`/dashboard/libro-de-obras/${id}/prevencion`}>
					<Button size={"lg"} className="bg-emerald-500 hover:bg-emerald-600">
						<span className="hidden lg:block">Área de Prevención</span>
						<Plus />
					</Button>
				</Link>
			</div>

			<WorkBookEntriesTable entries={data.workEntries} />
		</>
	)
}
