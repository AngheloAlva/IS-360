"use client"

import { useDocumentsCharts } from "@/hooks/documents/use-documents-charts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DocumentExpirationBarChart } from "./DocumentExpirationBarChart"
import { RecentChangesTable } from "./RecentChangesTable"
import { LineChart } from "./LineChart"
import { PieChart } from "./PieChart"
import { BarChart } from "./BarChart"
import { Metadata } from "./Metadata"

export default function DocumentCharts() {
	const { data } = useDocumentsCharts()

	return (
		<div className="w-full flex-1 space-y-4">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Metadata
					title="Total Documentos"
					value={data?.areaData.reduce((acc, item) => acc + item.value, 0) || 0}
					description="Documentos registrados"
					className="border-blue-500 bg-blue-500/10"
				/>
				<Metadata
					title="Documentos Vencidos"
					value={data?.expirationData.find((item) => item.name === "Vencidos")?.value || 0}
					description="Requieren atención inmediata"
					className="border-red-500 bg-red-500/10"
				/>
				<Metadata
					title="Responsables"
					value={data?.responsibleData.length || 0}
					description="Personas a cargo"
					className="border-green-500 bg-green-500/10"
				/>
				<Metadata
					title="Cambios Recientes"
					value={data?.recentChanges.length || 0}
					description="En los últimos 7 días"
					className="border-yellow-500 bg-yellow-500/10"
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

				<TabsContent value="areas" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<Card className="col-span-2">
							<CardHeader>
								<CardTitle>Distribución por Áreas</CardTitle>
								<CardDescription>Cantidad de documentos por área</CardDescription>
							</CardHeader>
							<CardContent className="pl-2">
								<BarChart data={data?.areaData || []} />
							</CardContent>
						</Card>

						<Card className="col-span-2 lg:col-span-1">
							<CardHeader>
								<CardTitle>Proporción por Áreas</CardTitle>
								<CardDescription>Distribución porcentual</CardDescription>
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
								<CardTitle>Estado de Vencimientos</CardTitle>
								<CardDescription>Documentos por período de vencimiento</CardDescription>
							</CardHeader>
							<CardContent className="pl-2">
								<DocumentExpirationBarChart
									data={data?.expirationData || []}
									colors={[
										"#dc2626",
										"#f97316",
										"#eab308",
										"#84cc16",
										"#10b981",
										"#0ea5e9",
										"#8b5cf6",
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
										"#dc2626",
										"#f97316",
										"#eab308",
										"#84cc16",
										"#10b981",
										"#0ea5e9",
										"#8b5cf6",
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
								<CardTitle>Documentos por Responsable</CardTitle>
								<CardDescription>Cantidad asignada a cada persona</CardDescription>
							</CardHeader>
							<CardContent className="pl-2">
								<BarChart
									data={data?.responsibleData || []}
									colors={["#2563eb", "#10b981", "#f59e0b", "#dc2626", "#8b5cf6"]}
								/>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Distribución por Responsable</CardTitle>
								<CardDescription>Proporción de carga de trabajo</CardDescription>
							</CardHeader>
							<CardContent>
								<PieChart
									data={data?.responsibleData || []}
									colors={["#2563eb", "#10b981", "#f59e0b", "#dc2626", "#8b5cf6"]}
								/>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="actividad" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
						<Card className="col-span-full lg:col-span-4">
							<CardHeader>
								<CardTitle>Actividad Diaria</CardTitle>
								<CardDescription>Cambios registrados en los últimos 7 días</CardDescription>
							</CardHeader>
							<CardContent>
								<LineChart data={data?.activityByDay || []} />
							</CardContent>
						</Card>
						<Card className="col-span-full lg:col-span-3">
							<CardHeader>
								<CardTitle>Cambios Recientes</CardTitle>
								<CardDescription>Últimas modificaciones realizadas</CardDescription>
							</CardHeader>
							<CardContent>
								<RecentChangesTable data={data?.recentChanges || []} />
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}
