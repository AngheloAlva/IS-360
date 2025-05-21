"use client"

import { BarChart, Clock, FileText, ListChecks } from "lucide-react"

import { useWorkBooksStats } from "@/hooks/work-orders/use-work-books-stats"
import { cn } from "@/lib/utils"

import { WorkBookProgressChart } from "@/components/sections/work-book/admin/charts/WorkBookProgressChart"
import { WorkBookEntriesChart } from "@/components/sections/work-book/admin/charts/WorkBookEntriesChart"
import { WorkBookStatusChart } from "@/components/sections/work-book/admin/charts/WorkBookStatusChart"
import { WorkBookDataTable } from "@/components/sections/work-book/admin/WorkBookDataTable"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

interface StatCardProps {
	title: string
	isLoading?: boolean
	value: string | number
	icon: React.ElementType
	colorVariant: "blue" | "green" | "red" | "yellow"
}

const StatCard = ({ title, isLoading, value, icon: Icon, colorVariant }: StatCardProps) => (
	<Card className="p-6">
		<div className="flex items-center gap-4">
			<div
				className={cn("bg-primary/10 rounded-lg p-3", {
					"bg-emerald-500/10": colorVariant === "green",
					"bg-amber-500/10": colorVariant === "yellow",
					"bg-rose-500/10": colorVariant === "red",
				})}
			>
				<Icon
					className={cn("text-primary", {
						"text-emerald-500": colorVariant === "green",
						"text-amber-500": colorVariant === "yellow",
						"text-rose-500": colorVariant === "red",
					})}
				/>
			</div>
			<div>
				<p className="text-muted-foreground text-sm">{title}</p>
				<h3 className="text-2xl font-bold">
					{isLoading ? <Skeleton className="h-8 w-20" /> : value}
				</h3>
			</div>
		</div>
	</Card>
)

export default function WorkBooksAdminPage() {
	const { data, isLoading } = useWorkBooksStats()

	return (
		<div className="flex w-full flex-col gap-6">
			<h1 className="text-3xl font-bold">Administración de Libros de Obras</h1>

			<Tabs defaultValue="overview" className="w-full space-y-6">
				<TabsList>
					<TabsTrigger value="overview">Vista General</TabsTrigger>
					<TabsTrigger value="stats">Estadísticas</TabsTrigger>
					<TabsTrigger value="charts">Gráficos</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-8">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<StatCard
							icon={Clock}
							colorVariant="blue"
							isLoading={isLoading}
							title="Libros Activos"
							value={data?.stats.activeCount || 0}
						/>
						<StatCard
							icon={ListChecks}
							isLoading={isLoading}
							colorVariant="green"
							title="Libros Completados"
							value={data?.stats.completedCount || 0}
						/>
						<StatCard
							icon={FileText}
							isLoading={isLoading}
							colorVariant="yellow"
							title="Total de Entradas"
							value={data?.stats.totalEntries || 0}
						/>
						<StatCard
							icon={BarChart}
							colorVariant="red"
							isLoading={isLoading}
							title="Progreso Promedio"
							value={`${Math.round(data?.stats.avgProgress || 0)}%`}
						/>
					</div>

					<WorkBookDataTable />
				</TabsContent>

				<TabsContent value="stats" className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<Card className="p-6">
							<h3 className="mb-4 font-semibold">Distribución por Estado</h3>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span>Activos</span>
									<span className="font-medium">{data?.stats.activeCount || 0}</span>
								</div>
								<div className="flex justify-between">
									<span>Completados</span>
									<span className="font-medium">{data?.stats.completedCount || 0}</span>
								</div>
								<div className="flex justify-between">
									<span>Total</span>
									<span className="font-medium">
										{(data?.stats.activeCount || 0) + (data?.stats.completedCount || 0)}
									</span>
								</div>
							</div>
						</Card>

						<Card className="p-6">
							<h3 className="mb-4 font-semibold">Entradas</h3>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span>Total de Entradas</span>
									<span className="font-medium">{data?.stats.totalEntries || 0}</span>
								</div>
								<div className="flex justify-between">
									<span>Promedio por Libro</span>
									<span className="font-medium">
										{Math.round(
											(data?.stats.totalEntries || 0) /
												((data?.stats.activeCount || 0) + (data?.stats.completedCount || 0))
										) || 0}
									</span>
								</div>
							</div>
						</Card>

						<Card className="p-6">
							<h3 className="mb-4 font-semibold">Progreso</h3>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span>Progreso Promedio</span>
									<span className="font-medium">{Math.round(data?.stats.avgProgress || 0)}%</span>
								</div>
							</div>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="charts" className="space-y-6">
					<div className="grid gap-6 md:grid-cols-2">
						<WorkBookStatusChart />
						<WorkBookEntriesChart />
						<WorkBookProgressChart />
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}
