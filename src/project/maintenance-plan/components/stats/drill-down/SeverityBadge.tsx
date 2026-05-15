import { cn } from "@/lib/utils"
import { Badge } from "@/shared/components/ui/badge"

interface SeverityBadgeProps {
	delayDays: number | null
}

/**
 * Severity badge for drill-down rows.
 *
 * Thresholds (spec):
 *   null | ≤ 0  → no badge ("En fecha")
 *   1 – 6       → mild   (green)
 *   7 – 30      → warn   (yellow)
 *   > 30        → critical (red)
 */
export function SeverityBadge({ delayDays }: SeverityBadgeProps) {
	if (delayDays === null || delayDays <= 0) {
		return (
			<Badge
				className={cn(
					"bg-green-500/10 text-green-600 dark:text-green-400"
				)}
				variant="secondary"
			>
				En fecha
			</Badge>
		)
	}

	if (delayDays < 7) {
		return (
			<Badge
				className={cn(
					"bg-green-500/15 text-green-700 dark:text-green-300"
				)}
				variant="secondary"
			>
				{delayDays}d atraso
			</Badge>
		)
	}

	if (delayDays <= 30) {
		return (
			<Badge
				className={cn(
					"bg-yellow-500/15 text-yellow-700 dark:text-yellow-300"
				)}
				variant="secondary"
			>
				{delayDays}d atraso
			</Badge>
		)
	}

	return (
		<Badge
			className={cn(
				"bg-red-500/15 text-red-700 dark:text-red-400"
			)}
			variant="secondary"
		>
			{delayDays}d atraso
		</Badge>
	)
}
