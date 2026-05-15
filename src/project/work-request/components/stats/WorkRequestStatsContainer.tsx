"use client"

import { ClockPlusIcon, FileSymlinkIcon, FileTypeIcon, TriangleAlertIcon } from "lucide-react"

import { useWorkRequestStats } from "../../hooks/use-work-request-stats"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"
import WorkRequestOperatorChart from "./WorkRequestOperatorChart"
import WorkRequestUrgencyChart from "./WorkRequestUrgencyChart"
import MonthlyTrendChart from "./MonthlyTrendChart"

export default function WorkRequestStatsContainer() {
	const { data, isLoading } = useWorkRequestStats()

	if (isLoading) return <ChartSkeleton />

	const statusData = [
		{ status: "Atendidas", count: data?.totalAttended || 0, fill: "var(--color-emerald-500)" },
		{ status: "Pendientes", count: data?.totalPending || 0, fill: "var(--color-sky-500)" },
		{ status: "Canceladas", count: data?.totalCancelled || 0, fill: "var(--color-rose-500)" },
	]

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
						<div className="bg-linear-to-br from-cyan-500 to-cyan-600 p-1.5 dark:from-cyan-700 dark:to-cyan-800" />

						<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
							<CardTitle className="text-base font-semibold">
								Total de Solicitud de Trabajo
							</CardTitle>
							<div className="rounded-lg bg-cyan-500/20 p-1.5 text-cyan-500 dark:bg-cyan-700/20 dark:text-cyan-700">
								<FileTypeIcon className="h-5 w-5 text-cyan-500 dark:text-cyan-700" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{data?.totalWorkRequests || 0}</div>
							<p className="text-muted-foreground text-xs">Solicitudes de trabajo registradas</p>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-none pt-0">
						<div className="bg-linear-to-br from-cyan-600 to-sky-500 p-1.5 dark:from-cyan-800 dark:to-sky-700" />
						<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
							<CardTitle className="text-base font-semibold">
								Solicitudes de Trabajo Urgentes
							</CardTitle>
							<div className="rounded-lg bg-cyan-600/20 p-1.5 text-cyan-600 dark:bg-cyan-800/20 dark:text-cyan-800">
								<TriangleAlertIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-800" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{data?.totalUrgent || 0}</div>
							<p className="text-muted-foreground text-xs">Solicitudes de trabajo urgentes</p>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-none pt-0">
						<div className="bg-linear-to-br from-sky-500 to-sky-600 p-1.5 dark:from-sky-700 dark:to-sky-800" />
						<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
							<CardTitle className="text-base font-semibold">
								Solicitudes de Trabajo Atendidas
							</CardTitle>
							<div className="rounded-lg bg-sky-500/20 p-1.5 text-sky-500 dark:bg-sky-700/20 dark:text-sky-700">
								<FileSymlinkIcon className="h-5 w-5 text-sky-500 dark:text-sky-700" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{data?.totalAttended || 0}</div>
							<p className="text-muted-foreground text-xs">Solicitudes de trabajo atendidas</p>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-none pt-0">
						<div className="bg-linear-to-br from-sky-600 to-sky-700 p-1.5 dark:from-sky-800 dark:to-sky-900" />
						<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
							<CardTitle className="text-base font-semibold">
								Solicitudes de Trabajo Pendientes
							</CardTitle>
							<div className="rounded-lg bg-sky-600/20 p-1.5 text-sky-600 dark:bg-sky-800/20 dark:text-sky-800">
								<ClockPlusIcon className="h-5 w-5 text-sky-600 dark:text-sky-800" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{data?.totalPending || 0}</div>
							<p className="text-muted-foreground text-xs">Solicitudes de trabajo pendientes</p>
						</CardContent>
					</Card>
				</div>
			</TabsContent>

			<TabsContent value="charts">
				<div className="grid gap-4 xl:grid-cols-3">
					{data?.operatorStats && <WorkRequestOperatorChart data={data.operatorStats} />}
					{data?.urgencyStats && <WorkRequestUrgencyChart data={data?.urgencyStats} />}
					{data?.monthlyTrend && <MonthlyTrendChart data={data?.monthlyTrend} />}
				</div>
			</TabsContent>
		</Tabs>
	)
}
