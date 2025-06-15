"use client"

import { ReviewStatus } from "@prisma/client"
import { cn } from "@/lib/utils"

import { Badge } from "@/shared/components/ui/badge"

interface StartupFolderStatusBadgeProps {
	status: ReviewStatus
	className?: string
}

export function StartupFolderStatusBadge({ status, className }: StartupFolderStatusBadgeProps) {
	const statusMap = {
		DRAFT: {
			label: "Borrador",
			className: "bg-neutral-500/10 text-neutral-500",
		},
		SUBMITTED: {
			label: "En revisión",
			className: "bg-cyan-500/10 text-cyan-500",
		},
		APPROVED: {
			label: "Aprobado",
			className: "bg-emerald-500/10 text-emerald-500",
		},
		REJECTED: {
			label: "Rechazado",
			className: "bg-rose-500/10 text-rose-500",
		},
		EXPIRED: {
			label: "Vencido",
			className: "bg-amber-500/10 text-amber-500",
		},
	}

	const statusInfo = statusMap[status]

	return <Badge className={cn(statusInfo.className, className)}>{statusInfo.label}</Badge>
}
