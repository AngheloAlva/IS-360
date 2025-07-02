"use client"

import { CheckCircle2, Clock, XCircle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import ChartSkeleton from "@/shared/components/stats/ChartSkeleton"

interface SafetyTalkStatsProps {
	data: {
		totalCompleted: number
		totalPassed: number
		totalFailed: number
		totalPending: number
	}
	isLoading?: boolean
}

export function SafetyTalkStats({ data, isLoading }: SafetyTalkStatsProps) {
	if (isLoading) {
		return <ChartSkeleton />
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card className="overflow-hidden border-none pt-0">
				<div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-1.5" />

				<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
					<CardTitle className="text-sm font-medium sm:text-base">Total Completadas</CardTitle>
					<div className="rounded-lg bg-emerald-500/20 p-1.5 text-emerald-500">
						<CheckCircle2 className="h-5 w-5 text-emerald-500" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{data.totalCompleted}</div>
					<p className="text-muted-foreground text-xs">Charlas completadas</p>
				</CardContent>
			</Card>

			<Card className="overflow-hidden border-none pt-0">
				<div className="bg-gradient-to-br from-emerald-600 to-sky-500 p-1.5" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
					<CardTitle className="text-sm font-medium sm:text-base">Aprobadas</CardTitle>
					<div className="rounded-lg bg-emerald-600/20 p-1.5 text-emerald-600">
						<CheckCircle2 className="h-5 w-5 text-emerald-500" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{data.totalPassed}</div>
					<p className="text-muted-foreground text-xs">Charlas aprobadas</p>
				</CardContent>
			</Card>

			<Card className="overflow-hidden border-none pt-0">
				<div className="bg-gradient-to-br from-sky-500 to-sky-600 p-1.5" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
					<CardTitle className="text-sm font-medium sm:text-base">Reprobadas</CardTitle>
					<div className="rounded-lg bg-sky-500/20 p-1.5 text-sky-500">
						<XCircle className="h-5 w-5 text-sky-500" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{data.totalFailed}</div>
					<p className="text-muted-foreground text-xs">Charlas reprobadas</p>
				</CardContent>
			</Card>

			<Card className="overflow-hidden border-none pt-0">
				<div className="bg-gradient-to-br from-sky-600 to-sky-700 p-1.5" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
					<CardTitle className="text-sm font-medium sm:text-base">Pendientes</CardTitle>
					<div className="rounded-lg bg-sky-600/20 p-1.5 text-sky-600">
						<Clock className="h-5 w-5 text-sky-600" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{data.totalPending}</div>
					<p className="text-muted-foreground text-xs">Charlas pendientes</p>
				</CardContent>
			</Card>
		</div>
	)
}
