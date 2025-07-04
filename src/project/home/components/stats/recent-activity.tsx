import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"
import { Clock, CheckCircle } from "lucide-react"
import { RecentActivityItem } from "@/project/home/hooks/use-homepage-stats"
import { Skeleton } from "@/shared/components/ui/skeleton"

interface RecentActivityProps {
	activities: RecentActivityItem[]
	isLoading: boolean
}

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
	if (isLoading) {
		return <RecentActivitySkeleton />
	}

	return (
		<Card className="shadow-md">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Actividad Reciente</CardTitle>
						<CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
					</div>
					<Clock className="h-4 w-4 text-blue-500" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{activities.length > 0 ? (
						activities.map((activity) => (
							<div
								key={activity.id}
								className="flex items-start space-x-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800"
							>
								<div className="mt-0.5 flex-shrink-0">
									<CheckCircle className="h-4 w-4 text-emerald-500" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
										{activity.description}
									</p>
									<div className="text-muted-foreground mt-1 flex items-center text-xs">
										<span>{activity.user}</span>
										<span className="mx-1">•</span>
										<span>{activity.time}</span>
									</div>
								</div>
							</div>
						))
					) : (
						<p className="text-muted-foreground py-4 text-center">
							No hay actividad reciente para mostrar
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

function RecentActivitySkeleton() {
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
									<Skeleton className="h-3 w-16" />
								</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
