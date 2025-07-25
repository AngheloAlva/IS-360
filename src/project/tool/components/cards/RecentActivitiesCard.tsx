"use client"

import { Clock, User, FileText, Calendar } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Badge } from "@/shared/components/ui/badge"

import type { ToolActivity, ActivityType } from "../../types"

interface RecentActivitiesCardProps {
	activities: ToolActivity[]
}

const activityTypeLabels: Record<ActivityType, string> = {
	ENTRY: "Entrada",
	EXIT: "Salida",
	STAY: "Permanece",
}

const activityTypeColors: Record<ActivityType, string> = {
	ENTRY: "bg-green-500/10 text-green-500",
	EXIT: "bg-red-500/10 text-red-500",
	STAY: "bg-blue-500/10 text-blue-500",
}

function formatDate(date: Date): string {
	return new Intl.DateTimeFormat("es-ES", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date)
}

function formatRelativeTime(date: Date): string {
	const now = new Date()
	const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

	if (diffInMinutes < 1) return "Hace un momento"
	if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`

	const diffInHours = Math.floor(diffInMinutes / 60)
	if (diffInHours < 24) return `Hace ${diffInHours}h`

	const diffInDays = Math.floor(diffInHours / 24)
	return `Hace ${diffInDays}d`
}

export function RecentActivitiesCard({ activities }: RecentActivitiesCardProps) {
	const sortedActivities = [...activities].sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
	)

	return (
		<Card className="gap-4">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Clock className="h-5 w-5" />
					Actividades Recientes
				</CardTitle>
			</CardHeader>

			<CardContent>
				{sortedActivities.length === 0 ? (
					<div className="text-muted-foreground py-8 text-center">
						<Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p>No hay actividades registradas</p>
					</div>
				) : (
					<ScrollArea className="max-h-[400px]">
						<div className="space-y-4">
							{sortedActivities.map((activity) => (
								<div
									key={activity.id}
									className="bg-card hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 transition-colors"
								>
									<div className="flex-shrink-0 rounded-md bg-orange-500/10 p-2">
										<User className="h-4 w-4 text-orange-500" />
									</div>
									<div className="min-w-0 flex-1">
										<div className="mb-1 flex items-center justify-between gap-2">
											<h4 className="truncate font-medium">Herramienta ID: {activity.toolId}</h4>
											<Badge
												variant="secondary"
												className={activityTypeColors[activity.activityType]}
											>
												{activityTypeLabels[activity.activityType]}
											</Badge>
										</div>

										{activity.workPermitId && (
											<div className="text-muted-foreground mb-1 flex items-center gap-1 text-sm">
												<FileText className="h-3 w-3" />
												Permiso: {activity.workPermitId}
											</div>
										)}

										{activity.comments && (
											<p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
												{activity.comments}
											</p>
										)}

										<div className="text-muted-foreground flex items-center justify-between text-sm">
											<span className="flex items-center gap-1">
												<User className="h-3 w-3" />
												{activity.createdBy}
											</span>
											<div className="flex flex-col items-end">
												<span>{formatRelativeTime(new Date(activity.timestamp))}</span>
												<span className="text-xs opacity-70">
													{formatDate(new Date(activity.timestamp))}
												</span>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
				)}
			</CardContent>
		</Card>
	)
}
