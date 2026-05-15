import type { WORK_ORDER_PRIORITY } from "@/generated/prisma/enums"

import { WorkOrderPriorityLabels } from "@/lib/consts/work-order-priority"
import { cn } from "@/lib/utils"

import { Badge } from "@/shared/components/ui/badge"

const PRIORITY_CLASS: Record<WORK_ORDER_PRIORITY, string> = {
	HIGH: "border-red-500 bg-red-500/10 text-red-500",
	MEDIUM: "border-orange-500 bg-orange-500/10 text-orange-500",
	LOW: "border-yellow-500 bg-yellow-500/10 text-yellow-500",
}

interface WorkOrderPriorityBadgeProps {
	priority: WORK_ORDER_PRIORITY
	className?: string
}

export function WorkOrderPriorityBadge({ priority, className }: WorkOrderPriorityBadgeProps) {
	return (
		<Badge variant="outline" className={cn(PRIORITY_CLASS[priority], className)}>
			{WorkOrderPriorityLabels[priority] ?? priority}
		</Badge>
	)
}
