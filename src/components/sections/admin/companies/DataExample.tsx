"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Building2, Truck, FileText, Clock, CheckCircle, AlertCircle, HardHat } from "lucide-react"
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"

// Datos de ejemplo basados en el esquema de la base de datos
const companyData = {
	totalCompanies: 15,
	companiesBySize: [
		{ name: "Empresa A", employees: 42, workOrders: 28, workPermits: 15, vehicles: 8 },
		{ name: "Empresa B", employees: 35, workOrders: 22, workPermits: 12, vehicles: 6 },
		{ name: "Empresa C", employees: 28, workOrders: 18, workPermits: 10, vehicles: 5 },
		{ name: "Empresa D", employees: 21, workOrders: 15, workPermits: 8, vehicles: 4 },
		{ name: "Empresa E", employees: 18, workOrders: 12, workPermits: 6, vehicles: 3 },
		{ name: "Otras empresas", employees: 65, workOrders: 45, workPermits: 25, vehicles: 14 },
	],
	workOrdersByCompany: [
		{ name: "Empresa A", completed: 18, inProgress: 7, pending: 3 },
		{ name: "Empresa B", completed: 14, inProgress: 5, pending: 3 },
		{ name: "Empresa C", completed: 10, inProgress: 6, pending: 2 },
		{ name: "Empresa D", completed: 8, inProgress: 4, pending: 3 },
		{ name: "Empresa E", completed: 7, inProgress: 3, pending: 2 },
	],
	vehicleTypes: [
		{ type: "CAR", count: 18, color: "#2563eb" },
		{ type: "TRUCK", count: 12, color: "#f59e0b" },
		{ type: "BUS", count: 5, color: "#10b981" },
		{ type: "MOTORCYCLE", count: 3, color: "#8b5cf6" },
		{ type: "TRACTOR", count: 2, color: "#ec4899" },
		{ type: "OTHER", count: 0, color: "#6b7280" },
	],
	workPermitStatus: {
		active: 28,
		completed: 45,
		cancelled: 3,
		expired: 0,
	},
	recentWorkOrders: [
		{
			id: "1",
			company: "Empresa A",
			type: "CORRECTIVE",
			status: "IN_PROGRESS",
			date: "17/04/2025",
		},
		{ id: "2", company: "Empresa C", type: "PREVENTIVE", status: "COMPLETED", date: "16/04/2025" },
		{ id: "3", company: "Empresa B", type: "PREDICTIVE", status: "PENDING", date: "15/04/2025" },
		{ id: "4", company: "Empresa D", type: "PROACTIVE", status: "IN_PROGRESS", date: "14/04/2025" },
	],
}

export function CompanyStatsCards() {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Empresas por Tamaño</CardTitle>
					<Building2 className="text-muted-foreground h-4 w-4" />
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{companyData.companiesBySize.slice(0, 5).map((company) => (
							<div key={company.name} className="flex items-center">
								<div className="w-full">
									<div className="mb-1 flex justify-between text-xs">
										<span>{company.name}</span>
										<span>{company.employees} empleados</span>
									</div>
									<Progress
										value={(company.employees / companyData.companiesBySize[0].employees) * 100}
										className="h-2"
									/>
								</div>
							</div>
						))}
					</div>
					<div className="text-muted-foreground mt-4 text-xs">
						Total: {companyData.totalCompanies} empresas registradas
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Distribución de Vehículos</CardTitle>
					<Truck className="text-muted-foreground h-4 w-4" />
				</CardHeader>
				<CardContent>
					<div className="h-[150px]">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={companyData.vehicleTypes.filter((item) => item.count > 0)}
									cx="50%"
									cy="50%"
									innerRadius={30}
									outerRadius={60}
									paddingAngle={2}
									dataKey="count"
								>
									{companyData.vehicleTypes.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip
									content={({ active, payload }) => {
										if (active && payload && payload.length) {
											return (
												<div className="bg-background rounded-lg border p-2 shadow-sm">
													<div className="text-sm font-medium">{payload[0].payload.type}</div>
													<div className="text-xs">Cantidad: {payload[0].payload.count}</div>
												</div>
											)
										}
										return null
									}}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>
					<div className="mt-2 grid grid-cols-3 gap-1">
						{companyData.vehicleTypes
							.filter((item) => item.count > 0)
							.map((vehicle) => (
								<Badge
									key={vehicle.type}
									variant="outline"
									className="flex items-center justify-center gap-1 py-1"
									style={{ borderColor: vehicle.color }}
								>
									<span
										className="h-2 w-2 rounded-full"
										style={{ backgroundColor: vehicle.color }}
									></span>
									<span className="text-xs">{vehicle.type}</span>
								</Badge>
							))}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Estado de Permisos de Trabajo</CardTitle>
					<FileText className="text-muted-foreground h-4 w-4" />
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4">
						<div className="flex flex-col items-center justify-center rounded-lg border bg-blue-50 p-3">
							<div className="text-2xl font-bold text-blue-600">
								{companyData.workPermitStatus.active}
							</div>
							<div className="text-muted-foreground text-xs">Activos</div>
						</div>
						<div className="flex flex-col items-center justify-center rounded-lg border bg-green-50 p-3">
							<div className="text-2xl font-bold text-green-600">
								{companyData.workPermitStatus.completed}
							</div>
							<div className="text-muted-foreground text-xs">Completados</div>
						</div>
						<div className="flex flex-col items-center justify-center rounded-lg border bg-amber-50 p-3">
							<div className="text-2xl font-bold text-amber-600">
								{companyData.workPermitStatus.cancelled}
							</div>
							<div className="text-muted-foreground text-xs">Cancelados</div>
						</div>
						<div className="flex flex-col items-center justify-center rounded-lg border bg-red-50 p-3">
							<div className="text-2xl font-bold text-red-600">
								{companyData.workPermitStatus.expired}
							</div>
							<div className="text-muted-foreground text-xs">Expirados</div>
						</div>
					</div>
					<div className="text-muted-foreground mt-4 text-xs">
						Total:{" "}
						{Object.values(companyData.workPermitStatus).reduce((acc, curr) => acc + curr, 0)}{" "}
						permisos de trabajo
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Órdenes de Trabajo Recientes</CardTitle>
					<Clock className="text-muted-foreground h-4 w-4" />
				</CardHeader>
				<CardContent className="p-0">
					<div className="divide-y">
						{companyData.recentWorkOrders.map((order) => (
							<div key={order.id} className="flex items-center gap-2 p-3">
								<div
									className={`flex h-8 w-8 items-center justify-center rounded-full ${
										order.status === "COMPLETED"
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
