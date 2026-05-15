import type { WORK_ORDER_TYPE } from "@/generated/prisma/enums"

import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"
import { cn } from "@/lib/utils"

import { Badge } from "@/shared/components/ui/badge"

const TYPE_CLASS: Record<WORK_ORDER_TYPE, string> = {
	CORRECTIVE: "border-red-500 bg-red-500/10 text-red-500",
	PREVENTIVE: "border-blue-500 bg-blue-500/10 text-blue-500",
	PREDICTIVE: "border-purple-500 bg-purple-500/10 text-purple-500",
	PROACTIVE: "border-emerald-500 bg-emerald-500/10 text-emerald-500",
}

interface WorkOrderTypeBadgeProps {
	type: WORK_ORDER_TYPE
	className?: string
}

export function WorkOrderTypeBadge({ type, className }: WorkOrderTypeBadgeProps) {
	return (
		<Badge variant="outline" className={cn(TYPE_CLASS[type], className)}>
			{WorkOrderTypeLabels[type as keyof typeof WorkOrderTypeLabels] ?? type}
		</Badge>
	)
}
