"use client"

import { FileText, Building2, TruckIcon, UsersIcon } from "lucide-react"

import { useCompanyStats } from "@/features/company/hooks/use-company-stats"

import { DocumentReviewProgressChart } from "@/features/company/components/stats/DocumentReviewProgressChart"
import { WorkEntryActivityChart } from "@/features/company/components/stats/WorkEntryActivityChart"
import { WorkOrderStatusChart } from "@/features/company/components/stats/WorkOrderStatusChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"

export default function CompanyStatsContainer() {
	const { data: stats, isLoading } = useCompanyStats()

	if (isLoading) {
		return <ChartSkeleton />
	}

	if (!stats) return null

	const totalCompanies = stats.companiesData.length
	const totalActiveUsers = stats.companiesData.reduce(
		(sum, company) => sum + company.activeUsers,
		0
	)
	const totalActiveWorkOrders = stats.companiesData.reduce(
		(sum, company) => sum + company.activeWorkOrders,
		0
	)
	const totalVehicles = stats.companiesData.reduce((sum, company) => sum + company.vehicles, 0)

	return (
		<div className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-blue-700 to-indigo-700 p-1.5" />

					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">Total Empresas</CardTitle>
						<div className="rounded-lg bg-blue-600/20 p-1.5 text-blue-600">
							<Building2 className="size-6" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalCompanies}</div>
						<p className="text-muted-foreground text-xs">Empresas registradas</p>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">Usuarios Activos</CardTitle>
						<div className="rounded-lg bg-indigo-600/20 p-1.5 text-indigo-600">
							<UsersIcon className="size-6" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalActiveUsers}</div>
						<p className="text-muted-foreground text-xs">Colaboradores registrados</p>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-1.5" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">OT Activas</CardTitle>
						<div className="rounded-lg bg-blue-500/20 p-1.5 text-blue-500">
							<FileText className="size-6" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalActiveWorkOrders}</div>
						<p className="text-muted-foreground text-xs">Órdenes de trabajo en curso</p>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-blue-400 to-indigo-400 p-1.5" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">Vehículos/Equipos</CardTitle>
						<div className="rounded-lg bg-indigo-500/20 p-1.5 text-indigo-500">
							<TruckIcon className="size-6" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalVehicles}</div>
						<p className="text-muted-foreground text-xs">Vehículos/Equipos registrados</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 xl:grid-cols-3">
				<DocumentReviewProgressChart
					data={stats.companiesData.map((company) => ({
						company: company.name,
						reviewed: company.reviewingDocuments,
						pending: company.pendingDocuments,
						approved: company.approvedDocuments,
						total:
							company.pendingDocuments + company.reviewingDocuments + company.approvedDocuments,
					}))}
				/>
				<WorkOrderStatusChart data={stats.workOrderStatusData} />
				<WorkEntryActivityChart data={stats.workEntryActivityData} />
			</div>
		</div>
	)
}
