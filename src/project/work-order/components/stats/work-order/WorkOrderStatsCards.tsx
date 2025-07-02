"use client"

import { ClipboardCheck, ClipboardList, Clock, AlertTriangle } from "lucide-react"

import { WorkOrderStatsResponse } from "@/project/work-order/hooks/use-work-order-stats"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

interface WorkOrderStatCardsProps {
	data: WorkOrderStatsResponse
}

export function WorkOrderStatCards({ data }: WorkOrderStatCardsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			<Card className="overflow-hidden border-none pt-0">
				<div className="bg-gradient-to-br from-orange-500 to-orange-600 p-1.5" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle>Total Órdenes</CardTitle>
					<div className="rounded-lg bg-orange-500/20 p-1.5 text-orange-500">
						<ClipboardList className="size-5.5" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{data.cards.total}</div>
					<p className="text-muted-foreground text-xs">Todas las órdenes de trabajo</p>
				</CardContent>
			</Card>

			<Card className="overflow-hidden border-none pt-0">
				<div className="bg-gradient-to-br from-orange-600 to-orange-700 p-1.5" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle>En Progreso</CardTitle>
					<div className="rounded-lg bg-orange-600/20 p-1.5 text-orange-600">
						<Clock className="size-5.5" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{data.cards.inProgress}</div>
					<p className="text-muted-foreground text-xs">Órdenes actualmente en ejecución</p>
				</CardContent>
			</Card>

			<Card className="overflow-hidden border-none pt-0">
				<div className="bg-gradient-to-br from-orange-700 to-red-500 p-1.5" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle>Alta Prioridad</CardTitle>
					<div className="rounded-lg bg-orange-700/20 p-1.5 text-orange-700">
						<AlertTriangle className="size-5.5" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{data.cards.highPriority}</div>
					<p className="text-muted-foreground text-xs">Órdenes críticas a atender</p>
				</CardContent>
			</Card>

			<Card className="overflow-hidden border-none pt-0">
				<div className="bg-gradient-to-br from-red-500 to-red-600 p-1.5" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle>Completadas</CardTitle>
					<div className="rounded-lg bg-red-500/20 p-1.5 text-red-500">
						<ClipboardCheck className="size-5.5" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{data.cards.completed}</div>
					<p className="text-muted-foreground text-xs">Órdenes finalizadas exitosamente</p>
				</CardContent>
			</Card>
		</div>
	)
}
