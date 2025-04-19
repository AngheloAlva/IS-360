"use client"

import { useState, useEffect } from "react"

import { getDocumentsChartData } from "@/actions/document-management/getDocumentsChartData"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentChangesTable } from "./RecentChangesTable"
import { LineChart } from "./LineChart"
import { PieChart } from "./PieChart"
import { BarChart } from "./BarChart"
import { Metadata } from "./Metadata"

type AreaData = {
	name: string
	value: number
	fill: string
}

type ExpirationData = {
	name: string
	value: number
}

type ResponsibleData = {
	name: string
	value: number
}

type ChangeHistory = {
	id: string
	fileName: string
	previousName: string
	modifiedBy: string
	modifiedAt: string
	reason: string
	userRole: string
	userArea: string | null
}

type ActivityData = {
	date: string
	changes: number
}

export default function DocumentCharts() {
	const [areaData, setAreaData] = useState<AreaData[]>([])
	const [expirationData, setExpirationData] = useState<ExpirationData[]>([])
	const [responsibleData, setResponsibleData] = useState<ResponsibleData[]>([])
	const [recentChanges, setRecentChanges] = useState<ChangeHistory[]>([])
	const [activityData, setActivityData] = useState<ActivityData[]>([])

	useEffect(() => {
		const fetchDocumentsChartData = async () => {
			try {
				const data = await getDocumentsChartData()
				setAreaData(data.areaData)
				setExpirationData(data.expirationData)
				setResponsibleData(data.responsibleData)
				setRecentChanges(data.recentChanges)
				setActivityData(data.activityByDay)
			} catch (error) {
				console.error("Error fetching chart data:", error)
			}
		}

		void fetchDocumentsChartData()
	}, [])

	return (
		<div className="w-full flex-1 space-y-4">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Metadata
					title="Total Documentos"
					value={areaData.reduce((acc, item) => acc + item.value, 0)}
					description="Documentos registrados"
					className="border-blue-500 bg-blue-500/10"
				/>
				<Metadata
					title="Documentos Vencidos"
					value={expirationData.reduce((acc, item) => acc + item.value, 0)}
					description="Requieren atención inmediata"
					className="border-red-500 bg-red-500/10"
				/>
				<Metadata
					title="Responsables"
					value={responsibleData.length}
					description="Personas a cargo"
					className="border-green-500 bg-green-500/10"
				/>
				<Metadata
					title="Cambios Recientes"
					value={recentChanges.length}
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
								<BarChart data={areaData} />
							</CardContent>
						</Card>

						<Card className="col-span-2 lg:col-span-1">
							<CardHeader>
								<CardTitle>Proporción por Áreas</CardTitle>
								<CardDescription>Distribución porcentual</CardDescription>
							</CardHeader>
							<CardContent>
								<PieChart data={areaData} />
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
								<BarChart
									data={expirationData}
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
									data={expirationData}
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
									data={responsibleData}
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
									data={responsibleData}
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
								<LineChart data={activityData} />
							</CardContent>
						</Card>
						<Card className="col-span-full lg:col-span-3">
							<CardHeader>
								<CardTitle>Cambios Recientes</CardTitle>
								<CardDescription>Últimas modificaciones realizadas</CardDescription>
							</CardHeader>
							<CardContent>
								<RecentChangesTable data={recentChanges} />
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}
