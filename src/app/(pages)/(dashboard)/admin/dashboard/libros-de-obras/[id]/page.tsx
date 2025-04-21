import { Plus, User, Clock, MapPin, PenTool, Calendar, FileText, Briefcase } from "lucide-react"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { format } from "date-fns"
import Link from "next/link"

import { getWorkOrderById } from "@/actions/work-orders/getWorkOrders"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"
import { WORK_ORDER_STATUS } from "@prisma/client"
import { auth } from "@/lib/auth"
import { cn } from "@/lib/utils"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApproveWorkBookClosure } from "@/components/sections/work-book/ApproveWorkBookClosure"
import WorkBookEntriesTable from "@/components/sections/work-book/WorkBookEntriesTable"
import BackButton from "@/components/shared/BackButton"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function AdminWorkBooksPage({ params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})
	const { id } = await params

	const { data } = await getWorkOrderById(id)

	if (!data) {
		return notFound()
	}

	return (
		<div className="w-full flex-1 space-y-6 p-4">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-3">
					<BackButton href="/admin/dashboard/libros-de-obras" />

					<div>
						<h1 className="text-2xl font-bold">{data.workName || "Libro de Obras no creado"}</h1>
						<p className="text-feature mt-1 text-base font-medium">{data.otNumber}</p>
					</div>
				</div>

				<div className="flex w-full flex-col items-end gap-2 md:w-64">
					<Badge
						className={cn("bg-primary/5 border-primary text-primary", {
							"border-yellow-500 bg-yellow-500/5 text-yellow-500":
								data.status === WORK_ORDER_STATUS.PENDING,
							"border-green-500 bg-green-500/5 text-green-500":
								data.status === WORK_ORDER_STATUS.COMPLETED,
							"border-red-500 bg-red-500/5 text-red-500":
								data.status === WORK_ORDER_STATUS.CANCELLED ||
								data.status === WORK_ORDER_STATUS.EXPIRED,
						})}
					>
						{WorkOrderStatusLabels[data.status as keyof typeof WorkOrderStatusLabels]}
					</Badge>

					<div className="flex items-center justify-between gap-4">
						<span className="text-sm font-medium">Progreso del trabajo:</span>
						<span className="text-sm font-bold">{data.workProgressStatus}%</span>
					</div>
					<Progress
						value={data.workProgressStatus || 0}
						className="h-2"
						indicatorClassName={
							data.workProgressStatus && data.workProgressStatus > 50
								? "bg-green-500"
								: "bg-yellow-500"
						}
					/>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-12">
				<Card className="md:col-span-12">
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-xl">
							<FileText className="text-primary h-5 w-5" />
							Detalles de la Orden de Trabajo
						</CardTitle>
						<CardDescription>
							Información detallada sobre el trabajo solicitado y sus especificaciones
						</CardDescription>
					</CardHeader>

					<CardContent>
						<div className="grid gap-6 md:grid-cols-2">
							<div className="space-y-4">
								<div className="flex items-start gap-3">
									<div className="mt-0.5 rounded-md bg-pink-500/10 p-1.5 text-pink-500">
										<PenTool className="h-5 w-5" />
									</div>
									<div>
										<p className="text-muted-foreground text-sm font-medium">Trabajo Solicitado</p>
										<p className="font-medium">{data.workRequest}</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="mt-0.5 rounded-md bg-amber-500/10 p-1.5 text-amber-500">
										<FileText className="h-5 w-5" />
									</div>
									<div>
										<p className="text-muted-foreground text-sm font-medium">Tipo de Trabajo</p>
										<p className="font-medium">{WorkOrderTypeLabels[data.type]}</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="mt-0.5 rounded-md bg-green-500/10 p-1.5 text-green-500">
										<Briefcase className="h-5 w-5" />
									</div>
									<div>
										<p className="text-muted-foreground text-sm font-medium">Contratista</p>
										<p className="font-medium">
											{data.company.name}{" "}
											<span className="text-muted-foreground">- {data.company.rut}</span>
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="mt-0.5 rounded-md bg-purple-500/10 p-1.5 text-purple-500">
										<MapPin className="h-5 w-5" />
									</div>
									<div>
										<p className="text-muted-foreground text-sm font-medium">Ubicación</p>
										<p className="font-medium">{data.workLocation}</p>
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<div className="flex items-start gap-3">
									<div className="mt-0.5 rounded-md bg-indigo-500/10 p-1.5 text-indigo-500">
										<Calendar className="h-5 w-5" />
									</div>
									<div>
										<p className="text-muted-foreground text-sm font-medium">Fecha de Inicio</p>
										<p className="font-medium">
											{data.workStartDate && format(data.workStartDate, "dd/MM/yyyy")}
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="mt-0.5 rounded-md bg-rose-500/10 p-1.5 text-rose-500">
										<Clock className="h-5 w-5" />
									</div>
									<div>
										<p className="text-muted-foreground text-sm font-medium">Fecha de Término</p>
										<p className="font-medium">
											{data.estimatedEndDate && format(data.estimatedEndDate, "dd/MM/yyyy")}
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="mt-0.5 rounded-md bg-cyan-500/10 p-1.5 text-cyan-500">
										<User className="h-5 w-5" />
									</div>
									<div>
										<p className="text-muted-foreground text-sm font-medium">Responsable</p>
										<p className="font-medium">
											{data.supervisor.name}{" "}
											<span className="text-muted-foreground">- {data.supervisor.phone}</span>
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="mt-0.5 rounded-md bg-orange-500/10 p-1.5 text-orange-500">
										<User className="h-5 w-5" />
									</div>
									<div>
										<p className="text-muted-foreground text-sm font-medium">Inspector OTC</p>
										<p className="font-medium">
											{data.responsible.name}{" "}
											<span className="text-muted-foreground">- {data.responsible.phone}</span>
										</p>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="flex w-full items-center gap-2">
				<h2 className="text-text text-2xl font-bold">Lista de Actividades</h2>

				{session?.user?.role === "SUPERADMIN" &&
					session.user.isSupervisor &&
					data.status === WORK_ORDER_STATUS.CLOSURE_REQUESTED && (
						<ApproveWorkBookClosure
							className="ml-auto"
							workOrderId={id}
							userId={session?.user?.id}
						/>
					)}

				<Link href={`/admin/dashboard/libros-de-obras/${id}/actividades-diarias`}>
					<Button
						size={"lg"}
						className="border-primary bg-primary hover:bg-primary/80 border text-white"
					>
						<Plus />
						<span className="hidden lg:block">Actividad Diaria</span>
					</Button>
				</Link>

				<Link href={`/admin/dashboard/libros-de-obras/${id}/actividades-adicionales`}>
					<Button
						size={"lg"}
						className="border border-cyan-500 bg-cyan-500 text-white hover:bg-cyan-600"
					>
						<Plus />
						<span className="hidden lg:block">Actividad Adicional</span>
					</Button>
				</Link>

				<Link href={`/admin/dashboard/libros-de-obras/${id}/inspeccion-otc`}>
					<Button
						size={"lg"}
						className="border border-purple-500 bg-purple-500 text-white hover:bg-purple-600"
					>
						<Plus />
						<span className="hidden lg:block">Inspección</span>
					</Button>
				</Link>
			</div>

			<WorkBookEntriesTable workOrderId={id} />
		</div>
	)
}
