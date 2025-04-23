"use client"

import { Clock, HardHat, FileText, Building2, CheckCircle, AlertCircle } from "lucide-react"

import { useCompanyStats } from "@/hooks/companies/useCompanyStats"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"

export default function CompanyStatsCards() {
	const { data: stats, isLoading } = useCompanyStats()

	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<Card key={i} className="col-span-1">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								<Skeleton className="h-4 w-[150px]" />
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Skeleton className="h-[150px] w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		)
	}

	if (!stats) return null

	return (
		<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
			<Card>
				<CardHeader className="flex flex-row items-center space-y-0 pb-2">
					<Building2 className="h-12 w-12 rounded-lg bg-teal-500/10 p-2 text-teal-500" />
					<CardTitle className="font-semibold">Empresas por Tamaño</CardTitle>
				</CardHeader>
				<CardContent className="flex h-full flex-col justify-between">
					<div className="space-y-2">
						{stats.companiesBySize.slice(0, 5).map((company) => (
							<div key={company.name} className="flex items-center">
								<div className="w-full">
									<div className="mb-1 flex justify-between text-xs">
										<span>{company.name}</span>
										<span>{company.employees} colaboradores</span>
									</div>
									<Progress
										value={(company.employees / stats.companiesBySize[0].employees) * 100}
										className="h-2"
									/>
								</div>
							</div>
						))}
					</div>
					<div className="text-muted-foreground mt-4 text-xs">
						Total: {stats.totalCompanies} empresas registradas
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center space-y-0 pb-2">
					<FileText className="h-12 w-12 rounded-lg bg-amber-500/10 p-2 text-amber-500" />
					<CardTitle className="font-semibold">Estado de Órdenes de Trabajo</CardTitle>
				</CardHeader>
				<CardContent className="flex h-full flex-col justify-between">
					<div className="grid grid-cols-2 gap-4">
						<div className="flex flex-col items-center justify-center rounded-lg border border-blue-500 bg-blue-500/10 p-3 py-5">
							<div className="text-2xl font-bold text-blue-600">
								{stats.workOrderStatus.inProgress}
							</div>
							<div className="text-text text-xs">En Proceso</div>
						</div>
						<div className="flex flex-col items-center justify-center rounded-lg border border-green-500 bg-green-500/10 p-3 py-5">
							<div className="text-2xl font-bold text-green-600">
								{stats.workOrderStatus.completed}
							</div>
							<div className="text-text text-xs">Completados</div>
						</div>
						<div className="flex flex-col items-center justify-center rounded-lg border border-yellow-500 bg-yellow-500/10 p-3 py-5">
							<div className="text-2xl font-bold text-yellow-600">
								{stats.workOrderStatus.cancelled}
							</div>
							<div className="text-text text-xs">Cancelados</div>
						</div>
						<div className="flex flex-col items-center justify-center rounded-lg border border-red-500 bg-red-500/10 p-3 py-5">
							<div className="text-2xl font-bold text-red-600">{stats.workOrderStatus.pending}</div>
							<div className="text-text text-xs">Pendientes</div>
						</div>
					</div>
					<div className="text-muted-foreground mt-4 text-xs">
						Total: {Object.values(stats.workOrderStatus).reduce((acc, curr) => acc + curr, 0)}{" "}
						permisos de trabajo
					</div>
				</CardContent>
			</Card>

			<Card className="md:col-span-2 xl:col-span-1 2xl:col-span-2">
				<CardHeader className="flex flex-row items-center space-y-0 pb-2">
					<Clock className="h-12 w-12 rounded-lg bg-rose-500/10 p-2 text-rose-500" />
					<CardTitle className="font-semibold">Órdenes de Trabajo Recientes</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<div className="divide-y">
						{stats.recentWorkOrders.map((order) => (
							<div key={order.id} className="flex items-center gap-2 p-3">
								<div
									className={`flex h-8 w-8 items-center justify-center rounded-full ${order.status === "COMPLETED"
											? "bg-green-100"
											: order.status === "IN_PROGRESS"
												? "bg-blue-100"
												: order.status === "PENDING"
													? "bg-amber-100"
													: "bg-red-100"
										}`}
								>
									{order.status === "COMPLETED" ? (
										<CheckCircle className="h-4 w-4 text-green-600" />
									) : order.status === "IN_PROGRESS" ? (
										<HardHat className="h-4 w-4 text-blue-600" />
									) : order.status === "PENDING" ? (
										<Clock className="h-4 w-4 text-amber-600" />
									) : (
										<AlertCircle className="h-4 w-4 text-red-600" />
									)}
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium">{order.company}</p>
									<p className="text-muted-foreground flex items-center gap-1 text-xs">
										<span>{order.type.toLowerCase()}</span>
									</p>
								</div>
								<div className="text-muted-foreground text-xs whitespace-nowrap">{order.date}</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
