"use client"

import {
	UsersIcon,
	FileXIcon,
	ReplaceIcon,
	PieChartIcon,
	FileTypeIcon,
	ChartColumnIcon,
	ChartSplineIcon,
} from "lucide-react"

import { useDocumentsCharts } from "@/project/document/hooks/use-documents-charts"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { DocumentExpirationChart } from "./DocumentExpirationChart"
import { DocumentActivityChart } from "./DocumentActivityChart"
import { RecentChangesTable } from "./RecentChangesTable"
import { ChangesPerDayChart } from "./ChangesPerDayChart"
import { ResponsiblesChart } from "./ResponsiblesChart"
import { Metadata } from "./Metadata"
import { PieChart } from "./PieChart"

export default function DocumentCharts() {
	const { data, isLoading } = useDocumentsCharts()

	return (
		<div className="w-full flex-1 space-y-4">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Metadata
					isLoading={isLoading}
					className="bg-blue-500"
					title="Total Documentos"
					description="Documentos registrados"
					value={data?.areaData.reduce((acc, item) => acc + item.value, 0) || 0}
					icon={
						<div className="rounded-lg bg-blue-500/20 p-1.5 text-blue-500">
							<FileTypeIcon />
						</div>
					}
				/>
				<Metadata
					isLoading={isLoading}
					className="bg-red-500"
					title="Documentos Vencidos"
					description="Requieren atención inmediata"
					value={data?.expirationData.find((item) => item.name === "Vencidos")?.value || 0}
					icon={
						<div className="rounded-lg bg-red-500/20 p-1.5 text-red-500">
							<FileXIcon />
						</div>
					}
				/>
				<Metadata
					title="Responsables"
					isLoading={isLoading}
					className="bg-green-500"
					description="Personas a cargo"
					value={data?.responsibleData.length || 0}
					icon={
						<div className="rounded-lg bg-green-500/20 p-1.5 text-green-500">
							<UsersIcon />
						</div>
					}
				/>
				<Metadata
					isLoading={isLoading}
					title="Cambios Recientes"
					className="bg-yellow-500"
					description="En los últimos 7 días"
					value={data?.recentChanges.length || 0}
					icon={
						<div className="rounded-lg bg-yellow-500/20 p-1.5 text-yellow-500">
							<ReplaceIcon />
						</div>
					}
				/>
			</div>

			<Tabs defaultValue="areas" className="mt-10 space-y-4">
				<TabsList className="h-11 w-full">
					<TabsTrigger className="py-2" value="areas">
						Por Áreas
					</TabsTrigger>
					<TabsTrigger className="py-2" value="vencimientos">
						Vencimientos
					</TabsTrigger>
					<TabsTrigger className="py-2" value="responsables">
						Responsables
					</TabsTrigger>
					<TabsTrigger className="py-2" value="actividad">
						Actividad
					</TabsTrigger>
				</TabsList>

				<TabsContents>
					<TabsContent value="areas" className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							<Card className="col-span-2">
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle>Actividad de Documentación</CardTitle>
											<CardDescription>
												Creación de carpetas y archivos en los últimos 30 días
											</CardDescription>
										</div>

										<ChartSplineIcon className="text-muted-foreground h-5 min-w-5" />
									</div>
								</CardHeader>

								<CardContent className="pl-2">
									<DocumentActivityChart data={data?.activityByDay || []} />
								</CardContent>
							</Card>

							<Card className="col-span-2 lg:col-span-1">
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle>Proporción por Áreas</CardTitle>
											<CardDescription>Distribución porcentual</CardDescription>
										</div>

										<PieChartIcon className="text-muted-foreground h-5 min-w-5" />
									</div>
								</CardHeader>
								<CardContent>
									<PieChart data={data?.areaData || []} />
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="vencimientos" className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							<Card className="col-span-2">
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle>Estado de Vencimientos</CardTitle>
											<CardDescription>Documentos por período de vencimiento</CardDescription>
										</div>

										<ChartColumnIcon className="text-muted-foreground h-5 min-w-5" />
									</div>
								</CardHeader>
								<CardContent className="pl-2">
									<DocumentExpirationChart
										data={data?.expirationData || []}
										colors={[
											"var(--color-red-500)",
											"var(--color-orange-500)",
											"var(--color-yellow-500)",
											"var(--color-green-500)",
											"var(--color-blue-500)",
											"var(--color-indigo-500)",
											"var(--color-purple-500)",
										]}
									/>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Distribución de Vencimientos</CardTitle>
									<CardDescription>Proporción por período</CardDescription>
								</CardHeader>
								<CardContent>
									<PieChart
										data={data?.expirationData || []}
										colors={[
											"var(--color-red-500)",
											"var(--color-orange-500)",
											"var(--color-yellow-500)",
											"var(--color-green-500)",
											"var(--color-blue-500)",
											"var(--color-indigo-500)",
											"var(--color-purple-500)",
										]}
									/>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="responsables" className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							<Card className="col-span-2">
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle>Documentos por Responsable</CardTitle>
											<CardDescription>Cantidad asignada a cada persona</CardDescription>
										</div>

										<ChartColumnIcon className="text-muted-foreground h-5 min-w-5" />
									</div>
								</CardHeader>

								<CardContent className="pl-2">
									<ResponsiblesChart
										data={data?.responsibleData || []}
										colors={[
											"var(--color-blue-500)",
											"var(--color-green-500)",
											"var(--color-yellow-500)",
											"var(--color-red-500)",
											"var(--color-indigo-500)",
											"var(--color-purple-500)",
										]}
									/>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle>Distribución por Responsable</CardTitle>
											<CardDescription>Proporción de carga de trabajo</CardDescription>
										</div>

										<PieChartIcon className="text-muted-foreground h-5 min-w-5" />
									</div>
								</CardHeader>
								<CardContent>
									<PieChart
										data={data?.responsibleData || []}
										colors={[
											"var(--color-blue-500)",
											"var(--color-green-500)",
											"var(--color-yellow-500)",
											"var(--color-red-500)",
											"var(--color-indigo-500)",
											"var(--color-purple-500)",
										]}
									/>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="actividad" className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							<Card className="col-span-full lg:col-span-2">
								<CardHeader>
									<CardTitle>Cambios por Día</CardTitle>
									<CardDescription>
										Modificaciones realizadas en los últimos 30 días
									</CardDescription>
								</CardHeader>
								<CardContent className="pl-2">
									<ChangesPerDayChart data={data?.changesPerDay || []} />
								</CardContent>
							</Card>

							<Card className="col-span-full lg:col-span-1">
								<CardHeader>
									<CardTitle>Últimas modificaciones</CardTitle>
									<CardDescription>Últimas modificaciones realizadas a documentos</CardDescription>
								</CardHeader>
								<CardContent>
									<RecentChangesTable data={data?.recentChanges || []} />
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</TabsContents>
			</Tabs>
		</div>
	)
}
