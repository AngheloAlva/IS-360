import { cn } from "@/lib/utils"
import type { SAFETY_TALK_CATEGORY, SAFETY_TALK_STATUS } from "@/generated/prisma/enums"
import type { WorkerComplianceSafetyTalk } from "@/project/worker-compliance/types/worker-compliance"

const CATEGORY_LABELS: Record<SAFETY_TALK_CATEGORY, string> = {
	ENVIRONMENT: "Medio Ambiente",
	VISITOR_TRM: "Visita TRM",
	VISITOR: "Visita",
	IRL: "IRL",
}

const STATUS_CONFIG: Record<
	SAFETY_TALK_STATUS,
	{ label: string; className: string }
> = {
	PENDING: {
		label: "Pendiente",
		className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
	},
	IN_PROGRESS: {
		label: "En progreso",
		className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
	},
	PASSED: {
		label: "Aprobado",
		className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
	},
	FAILED: {
		label: "Reprobado",
		className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
	},
	BLOCKED: {
		label: "Bloqueado",
		className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
	},
	MANUALLY_APPROVED: {
		label: "Aprobado manualmente",
		className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
	},
}

const ALL_CATEGORIES: SAFETY_TALK_CATEGORY[] = ["VISITOR_TRM", "VISITOR", "IRL"]

interface SafetyTalksSectionProps {
	safetyTalks: WorkerComplianceSafetyTalk[]
}

export function SafetyTalksSection({ safetyTalks }: SafetyTalksSectionProps) {
	// Build a map of category → worst status (or PENDING if no record)
	const statusByCategory = new Map<SAFETY_TALK_CATEGORY, SAFETY_TALK_STATUS>()
	for (const talk of safetyTalks) {
		const current = statusByCategory.get(talk.category)
		if (!current) {
			statusByCategory.set(talk.category, talk.status)
		} else {
			// Priority: FAILED > BLOCKED > IN_PROGRESS > PENDING > MANUALLY_APPROVED > PASSED
			const priority: SAFETY_TALK_STATUS[] = [
				"FAILED",
				"BLOCKED",
				"IN_PROGRESS",
				"PENDING",
				"MANUALLY_APPROVED",
				"PASSED",
			]
			if (priority.indexOf(talk.status) < priority.indexOf(current)) {
				statusByCategory.set(talk.category, talk.status)
			}
		}
	}

	return (
		<div className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm">
			<h3 className="text-sm font-semibold">Charlas de Seguridad</h3>

			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{ALL_CATEGORIES.map((category) => {
					const status = statusByCategory.get(category) ?? "PENDING"
					const config = STATUS_CONFIG[status]

					return (
						<div
							key={category}
							className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
						>
							<span className="text-sm">{CATEGORY_LABELS[category]}</span>
							<span
								className={cn(
									"rounded-full px-2 py-0.5 text-xs font-semibold",
									config.className
								)}
							>
								{config.label}
							</span>
						</div>
					)
				})}
			</div>
		</div>
	)
}
