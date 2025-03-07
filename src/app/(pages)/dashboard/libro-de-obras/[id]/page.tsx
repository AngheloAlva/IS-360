import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { ChevronLeft, CircleFadingArrowUp, Plus } from "lucide-react"
import { format } from "date-fns"
import { Suspense } from "react"
import Link from "next/link"

import { getWorkBook } from "@/actions/work-books/getWorkBook"
import { auth } from "@/lib/auth"
import { cn } from "@/lib/utils"

import AdditionalActivitiesTableSkeleton from "@/components/work-book/AdditionalActivitiesTableSkeleton"
import PreventionAreasTableSkeleton from "@/components/work-book/PreventionAreasTableSkeleton"
import DailyActivitiesTableSkeleton from "@/components/work-book/DailyActivitiesTableSkeleton"
import OtcInspectionsTableSkeleton from "@/components/work-book/OtcInspectionsTableSkeleton"
import AdditionalActivitiesTable from "@/components/work-book/AdditionalActivitiesTable"
import DailyActivitiesTable from "@/components/work-book/DailyActivitiesTable"
import PreventionAreasTable from "@/components/work-book/PreventionAreasTable"
import OtcInspectionsTable from "@/components/work-book/OtcInspectionsTable"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function WorkBooksPage({ params }: { params: Promise<{ id: string }> }) {
	const res = await auth.api.getSession({
		headers: await headers(),
	})

	if (!res) {
		return (
			<main className="flex h-screen items-center justify-center">
				<p>Acceso denegado</p>
			</main>
		)
	}

	const isAdmin = res.user.role === "ADMIN" || res.user.role === "SUPERADMIN"

	const { id } = await params

	const workBook = await getWorkBook(id)

	if (!workBook || !workBook.data) {
		return notFound()
	}

	return (
		<main className="flex h-full flex-col gap-8 p-4 pt-0 pb-40 lg:p-8 lg:pt-0">
			<div>
				<div className="mt-2 flex items-center justify-between">
					<div className="flex items-start justify-start gap-1">
						<Link
							href="/dashboard/libro-de-obras"
							className="hover:bg-primary/40 hover:text-primary mt-1 -ml-7 rounded-full transition-colors"
						>
							<ChevronLeft />
						</Link>

						<h1 className="flex flex-col text-2xl font-bold">
							{workBook.data.workName}
							<span className="text-feature text-base font-medium">
								OT: {workBook.data.otNumber.otNumber}
							</span>
						</h1>
					</div>

					<Link href={`/dashboard/libro-de-obras/${id}/editar`}>
						<Button size={"lg"}>
							<span className="hidden lg:block">Editar Libro de Obras</span>
							<CircleFadingArrowUp />
						</Button>
					</Link>
				</div>

				<div className="text-muted-foreground mt-2 flex flex-col items-start gap-4 md:mt-4 lg:flex-row lg:justify-between lg:gap-8">
					<ul className="flex flex-col gap-1">
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
							<b>Inspector OTC:</b> {workBook.data.otcInspectorName} -{" "}
							{workBook.data.otcInspectorPhone}
						</li>
					</ul>

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
			</div>

			<Separator />

			<div className="mb-14 flex flex-col gap-2">
				<div className="flex justify-between">
					<h2 className="text-2xl font-bold">Actividades Diarias</h2>
					<Link href={`/dashboard/libro-de-obras/${id}/actividades-diarias`}>
						<Button size={"lg"} className="bg-feature hover:bg-feature hover:brightness-90">
							<span className="hidden lg:block">Agregar</span>
							<Plus />
						</Button>
					</Link>
				</div>

				<Suspense fallback={<DailyActivitiesTableSkeleton />}>
					<DailyActivitiesTable workBookId={id} />
				</Suspense>
			</div>

			<div className="mb-14 flex flex-col gap-2">
				<div className="flex justify-between">
					<h2 className="text-2xl font-bold">Actividades Adicionales</h2>
					<Link href={`/dashboard/libro-de-obras/${id}/actividades-adicionales`}>
						<Button size={"lg"} className="bg-feature hover:bg-feature hover:brightness-90">
							<span className="hidden lg:block">Agregar</span>
							<Plus />
						</Button>
					</Link>
				</div>

				<Suspense fallback={<AdditionalActivitiesTableSkeleton />}>
					<AdditionalActivitiesTable workBookId={id} />
				</Suspense>
			</div>

			{isAdmin && (
				<div className="mb-14 flex flex-col gap-2">
					<div className="flex justify-between">
						<h2 className="text-2xl font-bold">Inspecciones OTC</h2>
						<Link href={`/dashboard/libro-de-obras/${id}/inspector-otc`}>
							<Button size={"lg"} className="bg-feature hover:bg-feature hover:brightness-90">
								<span className="hidden lg:block">Agregar</span>
								<Plus />
							</Button>
						</Link>
					</div>

					<Suspense fallback={<OtcInspectionsTableSkeleton />}>
						<OtcInspectionsTable workBookId={id} />
					</Suspense>
				</div>
			)}

			<div className="mb-14 flex flex-col gap-2">
				<div className="flex justify-between">
					<h2 className="text-2xl font-bold">Áreas de Prevención</h2>
					<Link href={`/dashboard/libro-de-obras/${id}/prevencion`}>
						<Button size={"lg"} className="bg-feature hover:bg-feature hover:brightness-90">
							<span className="hidden lg:block">Agregar</span>
							<Plus />
						</Button>
					</Link>
				</div>

				<Suspense fallback={<PreventionAreasTableSkeleton />}>
					<PreventionAreasTable workBookId={id} />
				</Suspense>
			</div>
		</main>
	)
}
