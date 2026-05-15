import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CarIcon } from "lucide-react"

import { StartupFolderStatusBadge } from "@/project/startup-folder/components/data/StartupFolderStatusBadge"
import { Badge } from "@/shared/components/ui/badge"

import type { ReviewStatus } from "@/generated/prisma/enums"

interface FolderStatusCardProps {
	title: string
	status: ReviewStatus
	docCount?: number
	expiresAt?: Date | null
	isDriver?: boolean
}

export function FolderStatusCard({
	title,
	status,
	docCount,
	expiresAt,
	isDriver = false,
}: FolderStatusCardProps) {
	return (
		<div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium">{title}</span>
					{isDriver && (
						<Badge
							variant="outline"
							className="flex items-center gap-1 border-blue-400 bg-blue-50 text-blue-700 text-xs dark:bg-blue-900/20 dark:text-blue-300"
						>
							<CarIcon className="size-3" />
							Conductor
						</Badge>
					)}
				</div>
				<StartupFolderStatusBadge status={status} />
			</div>

			<div className="flex items-center gap-4 text-xs text-muted-foreground">
				{docCount !== undefined && (
					<span>{docCount} documento{docCount !== 1 ? "s" : ""}</span>
				)}
				{expiresAt && (
					<span>
						Vence: {format(new Date(expiresAt), "dd/MM/yyyy", { locale: es })}
					</span>
				)}
			</div>
		</div>
	)
}
