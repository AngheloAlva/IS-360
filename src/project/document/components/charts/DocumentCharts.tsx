"use client"

import { ChartBarDecreasingIcon, ChartSplineIcon, PieChartIcon } from "lucide-react"

import { useDocumentsCharts } from "../../hooks/use-documents-charts"

import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { DocumentExpirationChart } from "./DocumentExpirationChart"
import { DocumentActivityChart } from "./DocumentActivityChart"
import { TopContributorsChart } from "./TopContributorsChart"
import { MonthlyTrendsChart } from "./MonthlyTrendsChart"
import { ChangesPerDayChart } from "./ChangesPerDayChart"
import { RecentChangesTable } from "./RecentChangesTable"
import { ResponsiblesChart } from "./ResponsiblesChart"
import { FileTypesChart } from "./FileTypesChart"
import { MetricsGrid } from "./MetricsGrid"
import { PieChart } from "./PieChart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

export default function DocumentCharts() {
	const { data, isLoading } = useDocumentsCharts()

	return (
		<div className="space-y-6">
			<MetricsGrid
				totalDocuments={data?.areaData.reduce((acc, item) => acc + item.value, 0) || 0}
				totalFolders={data?.metrics?.totalFolders || 0}
				expiredDocuments={data?.expirationData.find((item) => item.name === "Vencidos")?.value || 0}
				recentChanges={data?.recentChanges.length || 0}
				isLoading={isLoading}
			/>

			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="overview">Resumen</TabsTrigger>
					<TabsTrigger value="areas">Por Áreas</TabsTrigger>
					<TabsTrigger value="vencimientos">Vencimientos</TabsTrigger>
					<TabsTrigger value="responsables">Responsables</TabsTrigger>
					<TabsTrigger value="actividad">Actividad</TabsTrigger>
				</TabsList>

				<TabsContents>
					<TabsContent value="overview" className="space-y-4">
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
							<Card className="cursor-pointer border-none transition-shadow hover:shadow-md">
								<CardHeader>
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="text-lg font-semibold">Tendencias Mensuales</CardTitle>
											<CardDescription>Archivos subidos por mes en el año actual</CardDescription>
										</div>
										<ChartSplineIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
									</div>
								</CardHeader>
								<CardContent className="p-0 pr-4">
									<MonthlyTrendsChart data={data?.monthlyUploads || []} />
								</CardContent>
							</Card>

							<Card className="cursor-pointer border-none transition-shadow hover:shadow-md">
								<CardHeader>
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="text-lg font-semibold">Tipos de Archivos</CardTitle>
											<CardDescription>
												Distribución de los tipos de archivos subidos
											</CardDescription>
										</div>
										<PieChartIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
									</div>
								</CardHeader>
								<CardContent className="p-2">
									<FileTypesChart data={data?.fileTypes || []} />
								</CardContent>
							</Card>

							<Card className="cursor-pointer border-none transition-shadow hover:shadow-md">
								<CardHeader>
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="text-lg font-semibold">
												Principales Contribuidores
											</CardTitle>
											<CardDescription>
												Top 5 contribuyentes más activos en el año actual
											</CardDescription>
										</div>
										<ChartBarDecreasingIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
									</div>
								</CardHeader>
								<CardContent className="px-4">
									<TopContributorsChart data={data?.topContributors || []} />
								</CardContent>
							</Card>

							<Card className="cursor-pointer border-none transition-shadow hover:shadow-md">
								<CardHeader>
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="text-lg font-semibold">Distibución por Áreas</CardTitle>
											<CardDescription>
												Distribución de los archivos subidos por área
											</CardDescription>
										</div>
										<PieChartIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
									</div>
								</CardHeader>
								<CardContent className="p-0">
									<PieChart data={data?.areaData || []} />
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="areas" className="space-y-4">
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
							<Card className="cursor-pointer border-none transition-shadow hover:shadow-md">
								<CardHeader>
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="text-lg font-semibold">
												Actividad de Documentos
											</CardTitle>
											<CardDescription>Actividad diaria de documentos y carpetas</CardDescription>
										</div>
										<ChartSplineIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
									</div>
								</CardHeader>
								<CardContent className="p-0 pr-4">
									<DocumentActivityChart data={data?.activityByDay || []} />
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Proporción por Áreas</CardTitle>
								</CardHeader>
								<CardContent>
									<PieChart data={data?.areaData || []} />
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="vencimientos" className="space-y-4">
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
							<Card>
								<CardHeader>
									<CardTitle>Estado de Vencimientos</CardTitle>
								</CardHeader>
								<CardContent>
									<DocumentExpirationChart
										data={data?.expirationData || []}
										colors={[
											"#ef4444", // red-500
											"#f97316", // orange-500
											"#eab308", // yellow-500
											"#22c55e", // green-500
											"#3b82f6", // blue-500
											"#8b5cf6", // violet-500
											"#06b6d4", // cyan-500
										]}
									/>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Distribución de Vencimientos</CardTitle>
								</CardHeader>
								<CardContent>
									<PieChart
										data={data?.expirationData || []}
										colors={[
											"#ef4444", // red-500
											"#f97316", // orange-500
											"#eab308", // yellow-500
											"#22c55e", // green-500
											"#3b82f6", // blue-500
											"#8b5cf6", // violet-500
											"#06b6d4", // cyan-500
										]}
									/>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="responsables" className="space-y-4">
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
							<Card>
								<CardHeader>
									<CardTitle>Documentos por Responsable</CardTitle>
								</CardHeader>
								<CardContent>
									<ResponsiblesChart data={data?.responsibleData || []} />
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Distribución por Responsable</CardTitle>
								</CardHeader>
								<CardContent>
									<PieChart
										data={data?.responsibleData || []}
										colors={[
											"#3b82f6", // blue-500
											"#10b981", // emerald-500
											"#f59e0b", // amber-500
											"#ef4444", // red-500
											"#8b5cf6", // violet-500
											"#06b6d4", // cyan-500
											"#84cc16", // lime-500
											"#f97316", // orange-500
										]}
									/>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="actividad" className="space-y-4">
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
							<Card>
								<CardHeader>
									<CardTitle>Cambios por Día</CardTitle>
								</CardHeader>
								<CardContent>
									<ChangesPerDayChart data={data?.changesPerDay || []} />
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Modificaciones Recientes</CardTitle>
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
