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
			className: "bg-yellow-600/20 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-500",
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
			className: "bg-purple-600/20 text-purple-600 dark:bg-purple-500/20 dark:text-purple-500",
		},
		TO_UPDATE: {
			label: "A actualizar",
			className: "bg-blue-600/20 text-blue-600 dark:bg-blue-500/20 dark:text-blue-500",
		},
	}

	const statusInfo = statusMap[status]

	return <Badge className={cn(statusInfo.className, className)}>{statusInfo.label}</Badge>
}
