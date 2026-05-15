import type { WORK_ORDER_STATUS } from "@/generated/prisma/enums"

import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { cn } from "@/lib/utils"

import { Badge } from "@/shared/components/ui/badge"

const STATUS_CLASS: Record<WORK_ORDER_STATUS, string> = {
	PLANNED: "border-yellow-500 bg-yellow-500/10 text-yellow-500",
	PENDING: "border-red-500 bg-red-500/10 text-red-500",
	IN_PROGRESS: "border-orange-500 bg-orange-500/10 text-orange-500",
	CLOSURE_REQUESTED: "border-orange-600 bg-orange-600/10 text-orange-600",
	COMPLETED: "border-emerald-600 bg-emerald-600/10 text-emerald-600",
	CANCELLED: "border-red-700 bg-red-700/10 text-red-700",
}

interface WorkOrderStatusBadgeProps {
	status: WORK_ORDER_STATUS
	className?: string
}

export function WorkOrderStatusBadge({ status, className }: WorkOrderStatusBadgeProps) {
	return (
		<Badge variant="outline" className={cn(STATUS_CLASS[status], className)}>
			{WorkOrderStatusLabels[status] ?? status}
		</Badge>
	)
}
