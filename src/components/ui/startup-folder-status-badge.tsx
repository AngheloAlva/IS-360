"use client"

import { ReviewStatus } from "@prisma/client"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"

interface StartupFolderStatusBadgeProps {
	status: ReviewStatus
	className?: string
}

export function StartupFolderStatusBadge({ status, className }: StartupFolderStatusBadgeProps) {
	const statusMap = {
		DRAFT: {
			label: "Borrador",
			className: "bg-gray-500/10 text-gray-500",
		},
		SUBMITTED: {
			label: "Enviado para revisión",
			className: "bg-blue-500/10 text-blue-500",
		},
		APPROVED: {
			label: "Aprobado",
			className: "bg-green-500/10 text-green-500",
		},
		REJECTED: {
			label: "Rechazado",
			className: "bg-red-500/10 text-red-500",
		},
		EXPIRED: {
			label: "Vencido",
			className: "bg-red-500/10 text-red-500",
		},
	}

	const statusInfo = statusMap[status]

	return <Badge className={cn(statusInfo.className, className)}>{statusInfo.label}</Badge>
}
