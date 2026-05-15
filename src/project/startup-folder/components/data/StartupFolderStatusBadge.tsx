"use client"

import { ReviewStatus } from "@/generated/prisma/enums"
import { cn } from "@/lib/utils"

import { Badge } from "@/shared/components/ui/badge"
import {
	CircleCheckBigIcon,
	CircleDotDashed,
	CircleOffIcon,
	CircleXIcon,
	ClockAlertIcon,
	ClockFadingIcon,
	NotepadTextDashedIcon,
	RefreshCcwDotIcon,
} from "lucide-react"

interface StartupFolderStatusBadgeProps {
	status: ReviewStatus | "NOT_UPLOADED" | "NOT_APPLIED"
	className?: string
}

export function StartupFolderStatusBadge({ status, className }: StartupFolderStatusBadgeProps) {
	const statusMap: Record<string, { label: string; className: string; icon: React.ReactElement }> =
		{
			DRAFT: {
				label: "Borrador",
				icon: <NotepadTextDashedIcon />,
				className:
					"bg-neutral-600/20 text-neutral-600 dark:bg-neutral-400/20 dark:text-neutral-400",
			},
			NOT_UPLOADED: {
				label: "No subido",
				icon: <CircleDotDashed />,
				className: "bg-stone-600/20 text-stone-600 dark:bg-stone-400/20 dark:text-stone-400",
			},
			NOT_APPLIED: {
				label: "No Aplica",
				icon: <CircleOffIcon />,
				className: "bg-slate-600/20 text-slate-600 dark:bg-slate-400/20 dark:text-slate-400",
			},
			SUBMITTED: {
				label: "En revisión",
				icon: <ClockFadingIcon />,
				className: "bg-yellow-600/20 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-500",
			},
			APPROVED: {
				label: "Aprobado",
				icon: <CircleCheckBigIcon />,
				className:
					"bg-emerald-600/20 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-500",
			},
			REJECTED: {
				label: "Rechazado",
				icon: <CircleXIcon />,
				className: "bg-rose-600/20 text-rose-600 dark:bg-rose-500/20 dark:text-rose-500",
			},
			EXPIRED: {
				label: "Vencido",
				icon: <ClockAlertIcon />,
				className: "bg-purple-600/20 text-purple-600 dark:bg-purple-500/20 dark:text-purple-500",
			},
			TO_UPDATE: {
				label: "A actualizar",
				icon: <RefreshCcwDotIcon />,
				className: "bg-blue-600/20 text-blue-600 dark:bg-blue-500/20 dark:text-blue-500",
			},
		}

	const statusInfo = statusMap[status]

	return (
		<Badge className={cn(statusInfo.className, className)}>
			{statusInfo.icon}
			{statusInfo.label}
		</Badge>
	)
}
