import { Badge } from "@/shared/components/ui/badge"
import {
	SUPPORT_PRIORITY_META,
	SUPPORT_STATUS_META,
} from "@/project/support/constants/support-ticket-meta"

import type { SUPPORT_TICKET_PRIORITY, SUPPORT_TICKET_STATUS } from "@/generated/prisma/enums"

export function SupportStatusBadge({ status }: { status: SUPPORT_TICKET_STATUS }) {
	const Icon = SUPPORT_STATUS_META[status].icon

	return (
		<Badge variant="outline" className={SUPPORT_STATUS_META[status].className}>
			<Icon className="size-3.5" />
			{SUPPORT_STATUS_META[status].label}
		</Badge>
	)
}

export function SupportPriorityBadge({ priority }: { priority: SUPPORT_TICKET_PRIORITY }) {
	const Icon = SUPPORT_PRIORITY_META[priority].icon

	return (
		<Badge variant="outline" className={SUPPORT_PRIORITY_META[priority].className}>
			<Icon className="size-3.5" />
			{SUPPORT_PRIORITY_META[priority].label}
		</Badge>
	)
}
