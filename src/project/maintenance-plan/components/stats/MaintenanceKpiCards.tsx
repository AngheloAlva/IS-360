"use client"

import { CheckCircle2Icon, ClockIcon, MessageSquareIcon, TimerIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

interface MaintenanceKpiCardData {
	compliancePercent: number
	completedPreventiveWOs: number
	totalPreventiveWOs: number
	plansIncluded: number
	onTimePercent: number
	onTimeCount: number
	delayedCount: number
	avgClosureHours: number
	avgClosureDays: number
	avgWrResponseHours: number
}

interface MaintenanceKpiCardsProps {
	cards: MaintenanceKpiCardData
}

export default function MaintenanceKpiCards({ cards }: MaintenanceKpiCardsProps) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<Card className="overflow-hidden border-none pt-0">
				<div className="bg-linear-to-br from-indigo-500 to-indigo-600 p-1.5 dark:from-indigo-700 dark:to-indigo-800" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Salud Promedio de Planes</CardTitle>
					<div className="rounded-lg bg-indigo-500/20 p-1.5 text-indigo-500">
						<CheckCircle2Icon className="size-5.5" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{cards.compliancePercent}%</div>
					<p className="text-muted-foreground text-xs">
						Promedio de salud de {cards.plansIncluded}{" "}
						{cards.plansIncluded === 1 ? "plan activo" : "planes activos"}
					</p>
				</CardContent>
			</Card>

			<Card className="overflow-hidden border-none pt-0">
				<div className="bg-linear-to-br from-green-500 to-green-600 p-1.5 dark:from-green-700 dark:to-green-800" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">OTs en Fecha</CardTitle>
					<div className="rounded-lg bg-green-500/20 p-1.5 text-green-500">
						<ClockIcon className="size-5.5" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{cards.onTimePercent}%</div>
					<p className="text-muted-foreground text-xs">
						{cards.onTimeCount} en fecha, {cards.delayedCount} atrasadas
					</p>
				</CardContent>
			</Card>

			<Card className="overflow-hidden border-none pt-0">
				<div className="bg-linear-to-br from-purple-500 to-purple-600 p-1.5 dark:from-purple-700 dark:to-purple-800" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Tiempo Prom. Cierre</CardTitle>
					<div className="rounded-lg bg-purple-500/20 p-1.5 text-purple-500">
						<TimerIcon className="size-5.5" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{cards.avgClosureDays} días</div>
					<p className="text-muted-foreground text-xs">~{cards.avgClosureHours} horas hábiles</p>
				</CardContent>
			</Card>

			<Card className="overflow-hidden border-none pt-0">
				<div className="bg-linear-to-br from-cyan-500 to-cyan-600 p-1.5 dark:from-cyan-700 dark:to-cyan-800" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Resp. Solicitudes</CardTitle>
					<div className="rounded-lg bg-cyan-500/20 p-1.5 text-cyan-500">
						<MessageSquareIcon className="size-5.5" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{cards.avgWrResponseHours}h</div>
					<p className="text-muted-foreground text-xs">Tiempo promedio de atención</p>
				</CardContent>
			</Card>
		</div>
	)
}
