"use client"

import { Activity, Calendar, Clock } from "lucide-react"
import { useParams } from "next/navigation"

import { useCompanyTools } from "@/project/tool/hooks/useCompanyTools"

import { RecentActivitiesCard } from "@/project/tool/components/cards/RecentActivitiesCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { CompanyToolsTable } from "@/project/tool/components/data/CompanyToolsTable"
import ModuleHeader from "@/shared/components/ModuleHeader"
import { Badge } from "@/shared/components/ui/badge"

export default function CompanyToolsPage() {
	const params = useParams()
	const companyId = params.companyId as string

	const { company, tools, activities, addActivity } = useCompanyTools(companyId)

	if (!company) {
		return (
			<div className="flex h-64 items-center justify-center">
				<p className="text-muted-foreground">Empresa no encontrada</p>
			</div>
		)
	}

	return (
		<div className="w-full flex-1 space-y-4">
			<ModuleHeader
				title={`Herramientas -  ${company.name}`}
				backHref="/admin/dashboard/herramientas"
				description={`RUT: ${company.rut} • ${tools.length} herramientas registradas`}
				className="rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 p-6 shadow-lg"
			>
				<>
					<Badge className="bg-white/20 text-white">
						{tools.filter((t) => t.status === "IN_USE").length} en uso
					</Badge>
					<Badge className="bg-white/20 text-white">
						{tools.filter((t) => t.status === "AVAILABLE").length} disponibles
					</Badge>
				</>
			</ModuleHeader>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Herramientas</CardTitle>
						<Activity className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{tools.length}</div>
						<p className="text-muted-foreground text-xs">Registradas en el sistema</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">En Uso</CardTitle>
						<Clock className="h-4 w-4 text-orange-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-orange-600">
							{tools.filter((t) => t.status === "IN_USE").length}
						</div>
						<p className="text-muted-foreground text-xs">Actualmente asignadas</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Actividades Hoy</CardTitle>
						<Calendar className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{
								activities.filter((a) => {
									const today = new Date()
									const activityDate = new Date(a.timestamp)
									return activityDate.toDateString() === today.toDateString()
								}).length
							}
						</div>
						<p className="text-muted-foreground text-xs">Movimientos registrados</p>
					</CardContent>
				</Card>
			</div>

			<CompanyToolsTable tools={tools} onActivityAdd={addActivity} />

			<RecentActivitiesCard activities={activities} />
		</div>
	)
}
