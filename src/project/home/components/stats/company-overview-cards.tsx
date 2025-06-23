import { FileText, UsersIcon, CarIcon, BookCopyIcon } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { CompanyStatsResponse } from "@/project/home/hooks/use-company-stats"
import { Skeleton } from "@/shared/components/ui/skeleton"

interface CompanyOverviewCardsProps {
	data: CompanyStatsResponse | undefined
	isLoading: boolean
}

export function CompanyOverviewCards({ data, isLoading }: CompanyOverviewCardsProps) {
	if (isLoading || !data) {
		return <CompanyOverviewCardsSkeleton />
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Link href="/dashboard/colaboradores">
				<Card className="cursor-pointer overflow-hidden border-none pt-0 transition-all hover:scale-105">
					<div className="bg-gradient-to-br from-orange-600 to-red-700 p-1.5" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle>Colaboradores</CardTitle>
						<div className="rounded-lg bg-orange-100 p-1.5 text-orange-600 dark:bg-orange-900 dark:text-orange-400">
							<UsersIcon className="size-5.5" />
						</div>
					</CardHeader>

					<CardContent>
						<div className="text-2xl font-bold">{data.basicStats.collaborators}</div>
						<p className="text-muted-foreground text-xs">Colaboradores activos</p>
					</CardContent>
				</Card>
			</Link>

			<Link href="/dashboard/vehiculos">
				<Card className="cursor-pointer overflow-hidden border-none pt-0 transition-all hover:scale-105">
					<div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-1.5" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle>Vehículos</CardTitle>
						<div className="rounded-lg bg-emerald-100 p-1.5 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400">
							<CarIcon className="size-5.5" />
						</div>
					</CardHeader>

					<CardContent>
						<div className="text-2xl font-bold">{data.basicStats.vehicles}</div>
						<p className="text-muted-foreground text-xs">Vehículos activos</p>
					</CardContent>
				</Card>
			</Link>

			<Link href="/dashboard/libro-de-obras">
				<Card className="cursor-pointer overflow-hidden border-none pt-0 transition-all hover:scale-105">
					<div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-1.5" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle>Libros de Obra</CardTitle>
						<div className="rounded-lg bg-blue-100 p-1.5 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
							<BookCopyIcon className="size-5.5" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.basicStats.activeWorkOrders}</div>
						<p className="text-muted-foreground text-xs">Libros de obra activos</p>
					</CardContent>
				</Card>
			</Link>

			<Link href="/dashboard/permiso-de-trabajo">
				<Card className="cursor-pointer overflow-hidden border-none pt-0 transition-all hover:scale-105">
					<div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-1.5" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle>Permisos de Trabajo</CardTitle>
						<div className="rounded-lg bg-purple-100 p-1.5 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
							<FileText className="size-5.5" />
						</div>
					</CardHeader>

					<CardContent>
						<div className="text-2xl font-bold">{data.basicStats.activeWorkPermits}</div>
						<p className="text-muted-foreground text-xs">permisos de trabajo activos</p>
					</CardContent>
				</Card>
			</Link>
		</div>
	)
}

function CompanyOverviewCardsSkeleton() {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{[...Array(4)].map((_, i) => (
				<Card key={`card-skeleton-1-${i}`} className="overflow-hidden border-none pt-0 shadow-md">
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
	)
}
