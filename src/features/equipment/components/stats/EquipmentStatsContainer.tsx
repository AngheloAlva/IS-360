"use client"

import { BarChartIcon, BoxIcon, HardDriveIcon, ShieldCheckIcon } from "lucide-react"

import { useEquipmentStats } from "../../hooks/use-equipment-stats"

import MaintenanceActivityChart from "@/features/equipment/components/stats/MaintenanceActivityChart"
import EquipmentStatusChart from "@/features/equipment/components/stats/EquipmentStatusChart"
import EquipmentTypeChart from "@/features/equipment/components/stats/EquipmentTypeChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"

export default function EquipmentStatsContainer() {
	const { data, isLoading } = useEquipmentStats()

	if (isLoading) return <ChartSkeleton />

	return (
		<div className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-emerald-700 to-teal-700 p-1.5" />

					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">Total de Equipos</CardTitle>
						<div className="rounded-lg bg-emerald-600/20 p-1.5 text-emerald-600">
							<HardDriveIcon className="h-5 w-5 text-emerald-500" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data?.totalEquipment || 0}</div>
						<p className="text-muted-foreground text-xs">Equipos registrados</p>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-1.5" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">Equipos Activos</CardTitle>
						<div className="rounded-lg bg-teal-600/20 p-1.5 text-teal-600">
							<ShieldCheckIcon className="h-5 w-5 text-green-500" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{data?.equipmentByStatus.find((s) => s.status === "Operational")?.count || 0}
						</div>
						<p className="text-muted-foreground text-xs">Equipos operativos</p>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-1.5" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">Órdenes de Trabajo Activas</CardTitle>
						<div className="rounded-lg bg-emerald-500/20 p-1.5 text-emerald-500">
							<BarChartIcon className="h-5 w-5 text-emerald-500" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{data?.workOrdersByStatus.find((s) => s.status === "PENDING")?.count || 0}
						</div>
						<p className="text-muted-foreground text-xs">Órdenes de trabajo en curso</p>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-emerald-400 to-teal-400 p-1.5" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">Equipos Principales</CardTitle>
						<div className="rounded-lg bg-teal-500/20 p-1.5 text-teal-500">
							<BoxIcon className="h-5 w-5 text-teal-500" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{data?.equipmentHierarchy.parentEquipment || 0}
						</div>
						<p className="text-muted-foreground text-xs">Vehículos/Equipos registrados</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 xl:grid-cols-3">
				{data?.equipmentByStatus && <EquipmentStatusChart data={data.equipmentByStatus} />}
				{data?.equipmentByType && <EquipmentTypeChart data={data.equipmentByType} />}
				{data?.maintenanceActivityData && (
					<MaintenanceActivityChart data={data.maintenanceActivityData} />
				)}
			</div>
		</div>
	)
}
