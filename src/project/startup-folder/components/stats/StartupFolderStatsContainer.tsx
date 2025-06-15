"use client"

import { FolderIcon, UsersIcon, ClipboardCheckIcon, BuildingIcon } from "lucide-react"

import { useStartupFolderStats } from "@/project/startup-folder/hooks/use-startup-folder-stats"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"
import { DocumentsByFolderChart } from "./DocumentsByFolderChart"
import { DocumentStatusChart } from "./DocumentStatusChart"

export function StartupFolderStatsContainer() {
	const { data: stats, isLoading } = useStartupFolderStats()

	if (isLoading) return <ChartSkeleton />

	if (!stats) return null

	return (
		<div className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-teal-500 to-teal-600 p-1.5" />

					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">Total de carpetas</CardTitle>
						<div className="rounded-lg bg-teal-500/20 p-1.5 text-teal-500">
							<FolderIcon className="h-5 w-5 text-teal-500" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalFolders}</div>
						<p className="text-muted-foreground text-xs">Carpetas creadas</p>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-teal-600 to-cyan-500 p-1.5" />

					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">Carpetas por revisar</CardTitle>
						<div className="rounded-lg bg-teal-600/20 p-1.5 text-teal-600">
							<ClipboardCheckIcon className="h-5 w-5 text-teal-600" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalFoldersToReview}</div>
						<p className="text-muted-foreground text-xs">Carpetas por revisar</p>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-1.5" />

					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">Carpetas activas</CardTitle>
						<div className="rounded-lg bg-cyan-500/20 p-1.5 text-cyan-500">
							<UsersIcon className="h-5 w-5 text-cyan-500" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalFoldersActive}</div>
						<p className="text-muted-foreground text-xs">Carpetas activas</p>
					</CardContent>
				</Card>

				<Card className="overflow-hidden border-none pt-0">
					<div className="bg-gradient-to-br from-cyan-600 to-cyan-700 p-1.5" />

					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-base font-medium">Empresas aprobadas</CardTitle>
						<div className="rounded-lg bg-cyan-600/20 p-1.5 text-cyan-600">
							<BuildingIcon className="h-5 w-5 text-cyan-600" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalCompaniesApproved}</div>
						<p className="text-muted-foreground text-xs">Empresas aprobadas</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 xl:grid-cols-3">
				<DocumentStatusChart data={stats.charts.documentsByStatus} />
				<DocumentsByFolderChart data={stats.charts.documentsByFolder} />
			</div>
		</div>
	)
}
