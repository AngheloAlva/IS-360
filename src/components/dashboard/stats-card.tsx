import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface DashboardStatsCardProps {
	href: string
	title: string
	value: string
	loading?: boolean
	className?: string
	description: string
	icon?: React.ReactNode
}

export function DashboardStatsCard({
	icon,
	href,
	title,
	value,
	loading,
	className,
	description,
}: DashboardStatsCardProps) {
	return (
		<Link href={href} className="block transition-all hover:scale-[1.01]">
			<Card className={cn("gap-0", className)}>
				<CardHeader className="flex flex-row items-center justify-between pb-0">
					<CardTitle className="text-sm font-bold">{title}</CardTitle>
					{icon}
				</CardHeader>
				<CardContent className="pt-0">
					{loading ? (
						<Skeleton className="h-7 w-20" />
					) : (
						<div className="text-2xl font-bold">{value}</div>
					)}
					<p className="text-muted-foreground text-xs">{description}</p>
				</CardContent>
			</Card>
		</Link>
	)
}
