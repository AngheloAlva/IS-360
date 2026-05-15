import { AlertCircleIcon, CheckCircleIcon, ClockIcon, FileTextIcon } from "lucide-react"

import { Card, CardContent } from "@/shared/components/ui/card"
import { useSafetyTalkStats } from "../../hooks/use-safety-talk-stats"
import { Skeleton } from "@/shared/components/ui/skeleton"

export function SafetyTalkStatsContainer() {
	const { data: stats, isLoading } = useSafetyTalkStats()

	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i}>
						<CardContent className="p-6">
							<Skeleton className="h-7 w-7" />
							<Skeleton className="mt-4 h-7 w-28" />
							<Skeleton className="mt-1 h-4 w-36" />
						</CardContent>
					</Card>
				))}
			</div>
		)
	}

	if (!stats) return null

	const items = [
		{
			label: "Total de charlas",
			value: stats.totalSafetyTalks,
			icon: FileTextIcon,
			color: "text-blue-600",
			bg: "bg-blue-600/20",
		},
		{
			label: "Charlas aprobadas",
			value: stats.approvedSafetyTalks,
			icon: CheckCircleIcon,
			color: "text-emerald-600",
			bg: "bg-emerald-600/20",
		},
		{
			label: "Pendientes de aprobación",
			value: stats.pendingApprovalSafetyTalks,
			icon: ClockIcon,
			color: "text-amber-600",
			bg: "bg-amber-600/20",
		},
		{
			label: "Charlas expiradas",
			value: stats.expiredSafetyTalks,
			icon: AlertCircleIcon,
			color: "text-red-600",
			bg: "bg-red-600/20",
		},
	]

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{items.map((item) => (
				<Card key={item.label}>
					<CardContent className="p-6">
						<div className={`w-fit rounded-lg ${item.bg} p-2`}>
							<item.icon className={`h-7 w-7 ${item.color}`} />
						</div>

						<p className="mt-4 text-2xl font-bold">{item.value}</p>
						<p className="text-muted-foreground text-sm">{item.label}</p>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
