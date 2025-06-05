import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricCardProps {
	title: string
	value: string | number
	subtitle?: string
	trend?: {
		value: number
		isPositive: boolean
	}
	badge?: {
		text: string
		variant?: "default" | "secondary" | "destructive" | "outline"
	}
	className?: string
	icon?: React.ReactNode
}

export function MetricCard({
	title,
	value,
	subtitle,
	trend,
	badge,
	className,
	icon,
}: MetricCardProps) {
	return (
		<Card className={cn("", className)}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				{icon}
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				<div className="mt-2 flex items-center justify-between">
					{subtitle && <p className="text-muted-foreground text-xs">{subtitle}</p>}
					<div className="flex items-center gap-2">
						{badge && (
							<Badge variant={badge.variant || "secondary"} className="text-xs">
								{badge.text}
							</Badge>
						)}
						{trend && (
							<div
								className={cn(
									"flex items-center text-xs",
									trend.isPositive ? "text-green-600" : "text-red-600"
								)}
							>
								{trend.isPositive ? (
									<TrendingUp className="mr-1 h-3 w-3" />
								) : (
									<TrendingDown className="mr-1 h-3 w-3" />
								)}
								{Math.abs(trend.value)}%
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
