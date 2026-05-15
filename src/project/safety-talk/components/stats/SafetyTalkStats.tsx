"use client"

import { CheckCircle2Icon, ClockIcon, XCircleIcon } from "lucide-react"

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
				<div className="bg-linear-to-br from-emerald-500 to-emerald-600 p-1.5 dark:from-emerald-700 dark:to-emerald-800" />

				<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
					<CardTitle className="text-sm font-semibold sm:text-base">Total Completadas</CardTitle>
					<div className="rounded-lg bg-emerald-500/20 p-1.5 text-emerald-500 dark:bg-emerald-700/20 dark:text-emerald-700">
						<CheckCircle2Icon className="h-5 w-5" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{data.totalCompleted}</div>
					<p className="text-muted-foreground text-xs">Charlas completadas</p>
				</CardContent>
			</Card>

			<Card className="overflow-hidden border-none pt-0">
				<div className="bg-linear-to-br from-emerald-600 to-sky-500 p-1.5 dark:from-emerald-800 dark:to-sky-700" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
					<CardTitle className="text-sm font-semibold sm:text-base">Aprobadas</CardTitle>
					<div className="rounded-lg bg-emerald-600/20 p-1.5 text-emerald-600 dark:bg-emerald-800/20 dark:text-emerald-800">
						<CheckCircle2Icon className="h-5 w-5" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{data.totalPassed}</div>
					<p className="text-muted-foreground text-xs">Charlas aprobadas</p>
				</CardContent>
			</Card>

			<Card className="overflow-hidden border-none pt-0">
				<div className="bg-linear-to-br from-sky-500 to-sky-600 p-1.5 dark:from-sky-700 dark:to-sky-800" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
					<CardTitle className="text-sm font-semibold sm:text-base">Reprobadas</CardTitle>
					<div className="rounded-lg bg-sky-500/20 p-1.5 text-sky-500 dark:bg-sky-700/20 dark:text-sky-700">
						<XCircleIcon className="h-5 w-5" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{data.totalFailed}</div>
					<p className="text-muted-foreground text-xs">Charlas reprobadas</p>
				</CardContent>
			</Card>

			<Card className="overflow-hidden border-none pt-0">
				<div className="bg-linear-to-br from-sky-600 to-sky-700 p-1.5 dark:from-sky-800 dark:to-sky-900" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 sm:pb-2">
					<CardTitle className="text-sm font-semibold sm:text-base">Pendientes</CardTitle>
					<div className="rounded-lg bg-sky-600/20 p-1.5 text-sky-600 dark:bg-sky-800/20 dark:text-sky-800">
						<ClockIcon className="h-5 w-5" />
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
