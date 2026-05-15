"use client"

import { BarChartIcon, BoxIcon, HardDriveIcon, ShieldCheckIcon } from "lucide-react"

import { useEquipmentStats } from "../../hooks/use-equipment-stats"

import MaintenanceActivityChart from "@/project/equipment/components/stats/MaintenanceActivityChart"
import EquipmentStatusChart from "@/project/equipment/components/stats/EquipmentStatusChart"
import EquipmentTypeChart from "@/project/equipment/components/stats/EquipmentTypeChart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"

export default function EquipmentStatsContainer() {
	const { data, isLoading } = useEquipmentStats()

	if (isLoading) return <ChartSkeleton />

	return (
		<Tabs className="space-y-4" defaultValue="stats">
			<TabsList className="h-11 w-full py-5">
				<TabsTrigger className="h-8" value="stats">
					Estadisticas
				</TabsTrigger>
				<TabsTrigger className="h-8" value="charts">
					Graficas
				</TabsTrigger>
			</TabsList>

			<TabsContent value="stats">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card className="overflow-hidden border-none pt-0">
						<div className="bg-linear-to-br from-emerald-700 to-teal-700 p-1.5 dark:from-emerald-900 dark:to-teal-900" />

						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-base font-semibold">Total de Equipos</CardTitle>
							<div className="rounded-lg bg-emerald-600/20 p-1.5 text-emerald-600 dark:bg-emerald-800/20 dark:text-emerald-800">
								<HardDriveIcon className="h-5 w-5 text-emerald-500 dark:text-emerald-700" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{data?.totalEquipment || 0}</div>
							<p className="text-muted-foreground text-xs">Equipos registrados</p>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-none pt-0">
						<div className="bg-linear-to-br from-emerald-600 to-teal-600 p-1.5 dark:from-emerald-800 dark:to-teal-800" />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-base font-semibold">Equipos Activos</CardTitle>
							<div className="rounded-lg bg-teal-600/20 p-1.5 text-teal-600 dark:bg-teal-800/20 dark:text-teal-800">
								<ShieldCheckIcon className="h-5 w-5 text-green-500 dark:text-green-700" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{data?.operationalEquipment ?? 0}</div>
							<p className="text-muted-foreground text-xs">Equipos operativos</p>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-none pt-0">
						<div className="bg-linear-to-br from-emerald-500 to-teal-500 p-1.5 dark:from-emerald-700 dark:to-teal-700" />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-base font-semibold">Órdenes de Trabajo Activas</CardTitle>
							<div className="rounded-lg bg-emerald-500/20 p-1.5 text-emerald-500 dark:bg-emerald-700/20 dark:text-emerald-700">
								<BarChartIcon className="h-5 w-5 text-emerald-500 dark:text-emerald-700" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{data?.workOrdersByStatus.find((s) => s.status === "IN_PROGRESS")?.count || 0}
							</div>
							<p className="text-muted-foreground text-xs">Órdenes de trabajo en curso</p>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-none pt-0">
						<div className="bg-linear-to-br from-emerald-400 to-teal-400 p-1.5 dark:from-emerald-600 dark:to-teal-600" />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-base font-semibold">Equipos Principales</CardTitle>
							<div className="rounded-lg bg-teal-500/20 p-1.5 text-teal-500 dark:bg-teal-700/20 dark:text-teal-700">
								<BoxIcon className="h-5 w-5 text-teal-500 dark:text-teal-700" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{data?.equipmentHierarchy.parentEquipment || 0}
							</div>
							<p className="text-muted-foreground text-xs">Equipos/Ubicaciones registrados</p>
						</CardContent>
					</Card>
				</div>
			</TabsContent>

			<TabsContent value="charts">
				<div className="grid gap-4 xl:grid-cols-3">
					{data?.equipmentByStatus && <EquipmentStatusChart data={data.equipmentByStatus} />}
					{data?.equipmentByType && <EquipmentTypeChart data={data.equipmentByType} />}
					{data?.maintenanceActivityData && (
						<MaintenanceActivityChart data={data.maintenanceActivityData} />
					)}
				</div>
			</TabsContent>
		</Tabs>
	)
}
