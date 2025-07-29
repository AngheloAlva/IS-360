"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { FileText, FolderOpen, TrendingUp, AlertTriangle } from "lucide-react"

interface MetricsGridProps {
	totalDocuments: number
	totalFolders: number
	expiredDocuments: number
	recentChanges: number
	isLoading?: boolean
}

export function MetricsGrid({
	totalDocuments,
	totalFolders,
	expiredDocuments,
	recentChanges,
	isLoading = false,
}: MetricsGridProps) {
	const metrics = [
		{
			title: "Total Documentos",
			value: totalDocuments,
			icon: FileText,
			color: "bg-blue-500",
			description: "Documentos activos",
		},
		{
			title: "Total Carpetas",
			value: totalFolders,
			icon: FolderOpen,
			color: "bg-emerald-500",
			description: "Carpetas creadas",
		},
		{
			title: "Documentos Vencidos",
			value: expiredDocuments,
			icon: AlertTriangle,
			color: "bg-red-500",
			description: "Requieren atención",
		},
		{
			title: "Cambios Recientes",
			value: recentChanges,
			icon: TrendingUp,
			color: "bg-orange-500",
			description: "Últimas modificaciones",
		},
	]

	return (
		<div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			{metrics.map((metric, index) => {
				const Icon = metric.icon
				return (
					<Card key={index} className="transition-shadow hover:shadow-md">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-muted-foreground text-sm font-medium">
								{metric.title}
							</CardTitle>
							<div className={`rounded-md p-2 ${metric.color}`}>
								<Icon className="h-4 w-4 text-white" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{isLoading ? <Skeleton className="h-8 w-16" /> : metric.value}
							</div>
							<p className="text-muted-foreground mt-1 text-xs">{metric.description}</p>
						</CardContent>
					</Card>
				)
			})}
		</div>
	)
}
