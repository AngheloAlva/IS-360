import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { AlertItem } from "@/hooks/dashboard/use-homepage-stats"
import { Skeleton } from "@/components/ui/skeleton"
import { getAlertIcon, getAlertBadge } from "./alert-utils"

interface SystemAlertsProps {
	alerts: AlertItem[]
	isLoading: boolean
}

export function SystemAlerts({ alerts, isLoading }: SystemAlertsProps) {
	if (isLoading) {
		return <SystemAlertsSkeleton />
	}

	return (
		<Card className="shadow-md">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Alertas del Sistema</CardTitle>
						<CardDescription>Notificaciones importantes que requieren atención</CardDescription>
					</div>
					<AlertTriangle className="h-4 w-4 text-amber-500" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{alerts.length > 0 ? (
						alerts.map((alert) => (
							<div
								key={alert.id}
								className="flex items-start space-x-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800"
							>
								<div className="mt-0.5 flex-shrink-0">{getAlertIcon(alert.type)}</div>
								<div className="min-w-0 flex-1">
									<div className="flex items-center justify-between">
										<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
											{alert.message}
										</p>
										{getAlertBadge(alert.type)}
									</div>
									<div className="text-muted-foreground mt-1 flex items-center text-xs">
										<span className="font-medium">{alert.module}</span>
										<span className="mx-1">•</span>
										<span>{alert.time}</span>
									</div>
								</div>
							</div>
						))
					) : (
						<p className="text-muted-foreground py-4 text-center">
							No hay alertas activas en este momento
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

function SystemAlertsSkeleton() {
	return (
		<Card className="shadow-md">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<Skeleton className="mb-2 h-6 w-48" />
						<Skeleton className="h-4 w-72" />
					</div>
					<Skeleton className="h-4 w-4 rounded" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{[...Array(3)].map((_, i) => (
						<div key={i} className="flex items-start space-x-3">
							<Skeleton className="mt-1 h-5 w-5 rounded" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-5 w-full" />
								<div className="flex items-center space-x-2">
									<Skeleton className="h-3 w-16" />
									<Skeleton className="h-3 w-16" />
								</div>
							</div>
							<Skeleton className="h-5 w-14 rounded-full" />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
