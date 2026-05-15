"use client"

import { FileText, Building2, TruckIcon, UsersIcon } from "lucide-react"

import { useCompanyStats } from "@/project/company/hooks/use-company-stats"

import { DocumentReviewProgressChart } from "@/project/company/components/stats/DocumentReviewProgressChart"
import { WorkEntryActivityChart } from "@/project/company/components/stats/WorkEntryActivityChart"
import { WorkOrderStatusChart } from "@/project/company/components/stats/WorkOrderStatusChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"

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
						<div className="bg-linear-to-br from-blue-700 to-indigo-700 p-1.5 dark:from-blue-900 dark:to-indigo-900" />

						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-base font-semibold">Total Empresas</CardTitle>
							<div className="rounded-lg bg-blue-600/20 p-1.5 text-blue-600 dark:bg-blue-800/20 dark:text-blue-800">
								<Building2 className="size-6" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{totalCompanies}</div>
							<p className="text-muted-foreground text-xs">Empresas registradas</p>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-none pt-0">
						<div className="bg-linear-to-br from-blue-600 to-indigo-600 p-1.5 dark:from-blue-800 dark:to-indigo-800" />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-base font-semibold">Usuarios Activos</CardTitle>
							<div className="rounded-lg bg-indigo-600/20 p-1.5 text-indigo-600 dark:bg-indigo-800/20 dark:text-indigo-800">
								<UsersIcon className="size-6" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{totalActiveUsers}</div>
							<p className="text-muted-foreground text-xs">Colaboradores registrados</p>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-none pt-0">
						<div className="bg-linear-to-br from-blue-500 to-indigo-500 p-1.5 dark:from-blue-700 dark:to-indigo-700" />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-base font-semibold">OT Activas</CardTitle>
							<div className="rounded-lg bg-blue-500/20 p-1.5 text-blue-500 dark:bg-blue-700/20 dark:text-blue-700">
								<FileText className="size-6" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{totalActiveWorkOrders}</div>
							<p className="text-muted-foreground text-xs">Órdenes de trabajo en curso</p>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-none pt-0">
						<div className="bg-linear-to-br from-blue-400 to-indigo-400 p-1.5 dark:from-blue-600 dark:to-indigo-600" />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-base font-semibold">Vehículos/Equipos</CardTitle>
							<div className="rounded-lg bg-indigo-500/20 p-1.5 text-indigo-500 dark:bg-indigo-700/20 dark:text-indigo-700">
								<TruckIcon className="size-6" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{totalVehicles}</div>
							<p className="text-muted-foreground text-xs">Vehículos/Equipos registrados</p>
						</CardContent>
					</Card>
				</div>
			</TabsContent>

			<TabsContent value="charts">
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
			</TabsContent>
		</Tabs>
	)
}
