import { Building2, Settings, Users, FileText, Shield, Wrench, FolderOpen } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

import type { SystemOverview } from "@/project/home/hooks/use-homepage-stats"

interface SystemOverviewCardsProps {
	data: SystemOverview
	isLoading: boolean
}

export function SystemOverviewCards({ data, isLoading }: SystemOverviewCardsProps) {
	if (isLoading) {
		return <SystemOverviewCardsSkeleton />
	}

	return (
		<>
			<div className="absolute top-0 -z-10 h-full w-full bg-white">
				<div className="absolute top-0 right-0 bottom-auto left-auto h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(173,109,244,0.5)] opacity-50 blur-[80px]"></div>
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Link href="/admin/dashboard/empresas">
					<Card className="cursor-pointer overflow-hidden border-none pt-0 transition-all hover:scale-105">
						<div className="bg-gradient-to-br from-blue-500 to-blue-600 p-1.5" />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle>Empresas</CardTitle>
							<div className="rounded-lg bg-blue-100 p-1.5 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
								<Building2 className="size-5.5" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{data.companies}</div>
							<p className="text-muted-foreground text-xs">
								{data.activeCompanies} activas, {data.companiesWithPendingDocs} con docs pendientes
							</p>
						</CardContent>
					</Card>
				</Link>

				<Link href="/admin/dashboard/equipos">
					<Card className="cursor-pointer overflow-hidden border-none pt-0 transition-all hover:scale-105">
						<div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-1.5" />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle>Equipos</CardTitle>
							<div className="rounded-lg bg-emerald-100 p-1.5 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400">
								<Settings className="size-5.5" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{data.equipment}</div>
							<p className="text-muted-foreground text-xs">
								{data.operationalEquipment} operacionales, {data.criticalEquipment} críticos
							</p>
						</CardContent>
					</Card>
				</Link>

				<Link href="/admin/dashboard/usuarios">
					<Card className="cursor-pointer overflow-hidden border-none pt-0 transition-all hover:scale-105">
						<div className="bg-gradient-to-br from-purple-500 to-purple-600 p-1.5" />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle>Usuarios</CardTitle>
							<div className="rounded-lg bg-purple-100 p-1.5 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
								<Users className="size-5.5" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{data.users}</div>
							<p className="text-muted-foreground text-xs">
								{data.activeUsers} activos, {data.adminUsers} administradores
							</p>
						</CardContent>
					</Card>
				</Link>

				<Link href="/admin/dashboard/ordenes-de-trabajo">
					<Card className="cursor-pointer overflow-hidden border-none pt-0 transition-all hover:scale-105">
						<div className="bg-gradient-to-br from-orange-500 to-orange-600 p-1.5" />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle>Órdenes</CardTitle>
							<div className="rounded-lg bg-orange-100 p-1.5 text-orange-600 dark:bg-orange-900 dark:text-orange-400">
								<FileText className="size-5.5" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{data.workOrders}</div>
							<p className="text-muted-foreground text-xs">
								{data.inProgressWorkOrders} en progreso, {data.criticalWorkOrders} crítica
							</p>
						</CardContent>
					</Card>
				</Link>
			</div>

			{/* Segunda fila de módulos */}
			<div className="grid gap-4 md:grid-cols-3">
				<Link href="/admin/dashboard/permisos-de-trabajo">
					<Card className="cursor-pointer overflow-hidden border-none pt-0 transition-all hover:scale-105">
						<div className="bg-gradient-to-br from-red-500 to-red-600 p-1.5" />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle>Permisos de Trabajo</CardTitle>
							<div className="rounded-lg bg-red-100 p-1.5 text-red-600 dark:bg-red-900 dark:text-red-400">
								<Shield className="size-5.5" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{data.permits}</div>
							<p className="text-muted-foreground text-xs">{data.activePermits} activos</p>
						</CardContent>
					</Card>
				</Link>

				<Link href="/admin/dashboard/planes-de-mantenimiento">
					<Card className="cursor-pointer overflow-hidden border-none pt-0 transition-all hover:scale-105">
						<div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-1.5" />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle>Planes de Mantenimiento</CardTitle>
							<div className="rounded-lg bg-indigo-100 p-1.5 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400">
								<Wrench className="size-5.5" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{data.maintenancePlans}</div>
							<p className="text-muted-foreground text-xs">{data.activeMaintenancePlans} activos</p>
						</CardContent>
					</Card>
				</Link>

				<Link href="/admin/dashboard/carpetas-de-arranques">
					<Card className="cursor-pointer overflow-hidden border-none pt-0 transition-all hover:scale-105">
						<div className="bg-gradient-to-br from-teal-500 to-teal-600 p-1.5" />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle>Carpetas de Arranque</CardTitle>
							<div className="rounded-lg bg-teal-100 p-1.5 text-teal-600 dark:bg-teal-900 dark:text-teal-400">
								<FolderOpen className="size-5.5" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{data.startupFolders}</div>
							<p className="text-muted-foreground text-xs">
								{data.completedStartupFolders || 0} completadas
							</p>
						</CardContent>
					</Card>
				</Link>
			</div>
		</>
	)
}

function SystemOverviewCardsSkeleton() {
	return (
		<>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[...Array(4)].map((_, i) => (
					<Card key={`card-skeleton-1-${i}`} className="overflow-hidden border-none shadow-md">
						<div className="bg-gradient-to-br from-gray-200 to-gray-300 p-1 dark:from-gray-700 dark:to-gray-800" />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<Skeleton className="h-5 w-24" />
							<Skeleton className="h-8 w-8 rounded-full" />
						</CardHeader>
						<CardContent>
							<Skeleton className="mb-1 h-8 w-16" />
							<Skeleton className="h-4 w-36" />
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				{[...Array(3)].map((_, i) => (
					<Card key={`card-skeleton-2-${i}`} className="overflow-hidden border-none shadow-md">
						<div className="bg-gradient-to-br from-gray-200 to-gray-300 p-1 dark:from-gray-700 dark:to-gray-800" />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<Skeleton className="h-5 w-32" />
							<Skeleton className="h-8 w-8 rounded-full" />
						</CardHeader>
						<CardContent>
							<Skeleton className="mb-1 h-8 w-16" />
							<Skeleton className="h-4 w-36" />
						</CardContent>
					</Card>
				))}
			</div>
		</>
	)
}
