"use client"

import { ReviewStatus } from "@prisma/client"
import { cn } from "@/lib/utils"

import { Badge } from "@/shared/components/ui/badge"

interface StartupFolderStatusBadgeProps {
	status: ReviewStatus | "NOT_UPLOADED"
	className?: string
}

export function StartupFolderStatusBadge({ status, className }: StartupFolderStatusBadgeProps) {
	const statusMap = {
		DRAFT: {
			label: "Borrador",
			className: "bg-neutral-600/20 text-neutral-600 dark:bg-neutral-400/20 dark:text-neutral-400",
		},
		NOT_UPLOADED: {
			label: "No subido",
			className: "bg-stone-600/20 text-stone-600 dark:bg-stone-400/20 dark:text-stone-400",
		},
		SUBMITTED: {
			label: "En revisión",
			className: "bg-cyan-600/20 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-500",
		},
		APPROVED: {
			label: "Aprobado",
			className: "bg-emerald-600/20 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-500",
		},
		REJECTED: {
			label: "Rechazado",
			className: "bg-rose-600/20 text-rose-600 dark:bg-rose-500/20 dark:text-rose-500",
		},
		EXPIRED: {
			label: "Vencido",
			className: "bg-amber-600/20 text-amber-600 dark:bg-amber-500/20 dark:text-amber-500",
		},
	}

	const statusInfo = statusMap[status]

	return <Badge className={cn(statusInfo.className, className)}>{statusInfo.label}</Badge>
}
