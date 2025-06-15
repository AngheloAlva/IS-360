"use client"

import { BookOpen, ChevronRight, ClipboardCheck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { useCompanyStats } from "@/project/home/hooks/use-company-stats"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"
import { DashboardStatsCard } from "@/project/home/components/stats/stats-card"

interface CompanyDashboardContentProps {
	companyId: string
}

export function CompanyDashboardContent({ companyId }: CompanyDashboardContentProps) {
	const { data, isLoading } = useCompanyStats(companyId)

	return (
		<div className="flex w-full flex-col gap-8">
			<div className="relative flex h-[600px] items-center justify-center overflow-hidden rounded-none shadow">
				<Image
					fill
					priority
					alt="Dashboard Hero"
					className="object-cover"
					src="/images/auth/login.jpg"
				/>
				<div className="absolute inset-0 bg-black/30" />

				<div className="relative z-10 text-center text-white">
					<h1 className="text-4xl font-bold drop-shadow-2xl">Bienvenido a OTC 360</h1>
					<p className="mt-2 text-lg drop-shadow-2xl">
						Gestiona y supervisa los módulos disponibles para tu empresa.
					</p>
				</div>
			</div>

			<div className="space-y-8">
				{/* Sección de estadísticas */}
				<div className="space-y-4">
					<h2 className="text-2xl font-semibold">Estadísticas de tu Empresa</h2>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<DashboardStatsCard
							loading={isLoading}
							title="Total OTs"
							href="/dashboard/ordenes-de-trabajo"
							value={data?.workOrders.total.toString() ?? "--"}
							className="hover:border-amber-500 hover:bg-amber-500/10"
							icon={
								<BookOpen className="h-12 w-12 rounded-lg bg-amber-500/10 p-2 text-amber-500" />
							}
							description="Total de órdenes de trabajo asignadas"
						/>
						<DashboardStatsCard
							loading={isLoading}
							title="OTs Pendientes"
							href="/dashboard/ordenes-de-trabajo?status=PLANNED"
							value={data?.workOrders.planned.toString() ?? "--"}
							className="hover:border-blue-500 hover:bg-blue-500/10"
							icon={<BookOpen className="h-12 w-12 rounded-lg bg-blue-500/10 p-2 text-blue-500" />}
							description="Órdenes de trabajo por iniciar"
						/>
						<DashboardStatsCard
							loading={isLoading}
							title="OTs En Progreso"
							href="/dashboard/ordenes-de-trabajo?status=IN_PROGRESS"
							value={data?.workOrders.inProgress.toString() ?? "--"}
							className="hover:border-orange-500 hover:bg-orange-500/10"
							icon={
								<BookOpen className="h-12 w-12 rounded-lg bg-orange-500/10 p-2 text-orange-500" />
							}
							description="Órdenes de trabajo en ejecución"
						/>
						<DashboardStatsCard
							loading={isLoading}
							title="Usuarios Activos"
							href="/dashboard/colaboradores"
							value={data?.users.total.toString() ?? "--"}
							className="hover:border-green-500 hover:bg-green-500/10"
							icon={
								<ClipboardCheck className="h-12 w-12 rounded-lg bg-green-500/10 p-2 text-green-500" />
							}
							description="Usuarios registrados en tu empresa"
						/>
					</div>
				</div>

				{/* Sección de próximas OTs */}
				{data && data.workOrders.upcoming.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Próximas Órdenes de Trabajo</CardTitle>
							<CardDescription>OTs programadas para los próximos 7 días</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4 divide-y">
								{data.workOrders.upcoming.map((workOrder) => (
									<Link
										key={workOrder.id}
										className="group block"
										href={`/dashboard/ordenes-de-trabajo/${workOrder.id}`}
									>
										<div className="flex flex-col gap-1">
											<h4 className="group-hover:text-primary font-semibold">
												{workOrder.workName || `OT: ${workOrder.otNumber}`}
												<ChevronRight className="-mt-0.5 inline h-5 w-5 transition-all group-hover:translate-x-1" />
											</h4>
											<p className="text-muted-foreground group-hover:text-text text-sm transition-colors">
												Ubicación: {workOrder.workLocation || "No especificada"}
											</p>
											<p className="text-muted-foreground group-hover:text-text text-sm transition-colors">
												Fecha Programada:{" "}
												{new Date(workOrder.programDate).toLocaleDateString("es-ES", {
													day: "numeric",
													month: "long",
													year: "numeric",
												})}
											</p>
										</div>
									</Link>
								))}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	)
}
