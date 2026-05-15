"use client"

import { FolderIcon, UsersIcon, ClipboardCheckIcon, BuildingIcon } from "lucide-react"

import { useStartupFolderStats } from "@/project/startup-folder/hooks/use-startup-folder-stats"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"
import { DocumentsByFolderChart } from "./DocumentsByFolderChart"
import { DocumentStatusChart } from "./DocumentStatusChart"

export function StartupFolderStatsContainer() {
	const { data: stats, isLoading } = useStartupFolderStats()

	if (isLoading) return <ChartSkeleton />

	if (!stats) return null

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
						<div className="bg-linear-to-br from-teal-500 to-teal-700 p-1.5 dark:from-teal-700 dark:to-teal-900" />

						<CardHeader className="flex flex-row items-center justify-between space-y-0 md:pb-2">
							<CardTitle className="text-sm font-semibold md:text-base">
								Total de carpetas
							</CardTitle>
							<div className="rounded-lg bg-teal-500/10 p-1.5 text-teal-500">
								<FolderIcon className="h-5 w-5 text-teal-500" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.totalFolders}</div>
							<p className="text-muted-foreground text-xs">Carpetas creadas</p>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-none pt-0">
						<div className="bg-linear-to-br from-teal-600 to-cyan-700 p-1.5 dark:from-teal-700 dark:to-cyan-900" />

						<CardHeader className="flex flex-row items-center justify-between space-y-0 md:pb-2">
							<CardTitle className="text-sm font-semibold md:text-base">
								Carpetas por revisar
							</CardTitle>
							<div className="rounded-lg bg-teal-600/10 p-1.5 text-teal-600">
								<ClipboardCheckIcon className="h-5 w-5 text-teal-600" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.totalFoldersToReview}</div>
							<p className="text-muted-foreground text-xs">Carpetas por revisar</p>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-none pt-0">
						<div className="bg-linear-to-br from-cyan-500 to-cyan-700 p-1.5 dark:from-cyan-700 dark:to-cyan-900" />

						<CardHeader className="flex flex-row items-center justify-between space-y-0 md:pb-2">
							<CardTitle className="text-sm font-semibold md:text-base">Carpetas activas</CardTitle>
							<div className="rounded-lg bg-cyan-500/10 p-1.5 text-cyan-500">
								<UsersIcon className="h-5 w-5 text-cyan-500" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.totalFoldersActive}</div>
							<p className="text-muted-foreground text-xs">Carpetas activas</p>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-none pt-0">
						<div className="bg-linear-to-br from-cyan-600 to-cyan-700 p-1.5 dark:from-cyan-700 dark:to-cyan-900" />

						<CardHeader className="flex flex-row items-center justify-between space-y-0 md:pb-2">
							<CardTitle className="text-sm font-semibold md:text-base">
								Empresas aprobadas
							</CardTitle>
							<div className="rounded-lg bg-cyan-600/10 p-1.5 text-cyan-600">
								<BuildingIcon className="h-5 w-5 text-cyan-600" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.totalCompaniesApproved}</div>
							<p className="text-muted-foreground text-xs">Empresas aprobadas</p>
						</CardContent>
					</Card>
				</div>
			</TabsContent>

			<TabsContent value="charts">
				<div className="grid gap-4 xl:grid-cols-3">
					<DocumentStatusChart data={stats.charts.documentsByStatus} />
					<DocumentsByFolderChart data={stats.charts.subfoldersByType} />
				</div>
			</TabsContent>
		</Tabs>
	)
}
