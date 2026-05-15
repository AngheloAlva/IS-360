import Link from "next/link"

import type { SAFETY_TALK_CATEGORY } from "@/generated/prisma/enums"
import type { UserSafetyTalk } from "@/generated/prisma/client"

import { cn } from "@/lib/utils"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"
import { Separator } from "@/shared/components/ui/separator"

type Attempt = {
	id: string
	score: number
	completedAt: Date | null
}

interface SafetyTalkListProps {
	userSafetyTalks: (UserSafetyTalk & {
		attempts: Pick<Attempt, "id" | "score" | "completedAt">[]
		approvalBy: { name: string } | null
	})[]
}

type SafetyTalk = {
	id: string
	title: string
	description: string
	category: SAFETY_TALK_CATEGORY
	href: string
	disabled?: boolean
	actionLabel?: string
}

const SAFETY_TALKS: SafetyTalk[] = [
	{
		id: "visitor-prs",
		title: "Charla de Seguridad para Visitas - PRS",
		description: "Requisitos e instrucciones para visitas en Planta PRS.",
		category: "VISITOR",
		href: "/dashboard/charlas-de-seguridad/visitas?tab=prs",
	},
	{
		id: "visitor-trm",
		title: "Charla de Seguridad para Visitas - TRM",
		description: "Inducción obligatoria para el ingreso a instalaciones TRM.",
		category: "VISITOR_TRM",
		href: "/dashboard/charlas-de-seguridad/visitas?tab=trm",
	},
	{
		id: "irl",
		title: "Inducción de Seguridad IRL",
		description: "Introducción a los riesgos laborales presentes en OTC.",
		category: "IRL",
		href: "/dashboard/charlas-de-seguridad/visitas?tab=irl",
	},
]

const formatDateTime = (
	value: Date | string | null | undefined,
	options?: Intl.DateTimeFormatOptions
) => {
	if (!value) return ""

	try {
		return new Intl.DateTimeFormat("es-CL", {
			dateStyle: "short",
			...options,
		}).format(new Date(value))
	} catch (error) {
		console.error("Invalid date", error)
		return ""
	}
}

export function SafetyTalkList({ userSafetyTalks }: SafetyTalkListProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2">
			{SAFETY_TALKS.map((talk) => {
				const userTalk = userSafetyTalks.find((ut) => ut.category === talk.category)
				const isExpired = Boolean(userTalk?.expiresAt && new Date(userTalk.expiresAt) < new Date())
				const isPassed = userTalk?.status === "PASSED" && !isExpired
				const isBlocked = userTalk?.status === "BLOCKED"
				const isInProgress = userTalk?.status === "IN_PROGRESS"
				const hasFailedAttempts = userTalk?.status === "FAILED"
				const nextAttemptAt = userTalk?.nextAttemptAt
				const isNextAttemptPending = Boolean(nextAttemptAt && new Date(nextAttemptAt) > new Date())

				const isDisabled = Boolean(
					talk.disabled === true ||
						isBlocked ||
						(isInProgress && !isExpired) ||
						(hasFailedAttempts && isNextAttemptPending)
				)

				const actionLabel =
					talk.actionLabel || (isPassed && !isExpired ? "Ver detalles" : "Ver charla")

				return (
					<Card key={talk.id} className={cn(isPassed && "border-green-500/20")}>
						<CardHeader>
							<div className="flex items-center justify-between gap-2">
								<div>
									<CardTitle>{talk.title}</CardTitle>
									<CardDescription>{talk.description}</CardDescription>
								</div>
								<StatusBadges
									isBlocked={isBlocked}
									isExpired={Boolean(isExpired)}
									isFailed={hasFailedAttempts}
									isInProgress={isInProgress}
									isPassed={isPassed}
								/>
							</div>
						</CardHeader>

						<CardContent className="mt-auto space-y-4">
							{userTalk && (
								<div className="space-y-4">
									{isPassed && userTalk.expiresAt && (
										<p className="text-muted-foreground text-sm">
											Vigencia hasta: {formatDateTime(userTalk.expiresAt)}
										</p>
									)}

									{hasFailedAttempts && nextAttemptAt && (
										<p className="text-muted-foreground text-sm">
											Próximo intento disponible:{" "}
											{formatDateTime(nextAttemptAt, {
												dateStyle: "short",
												timeStyle: "short",
											})}
										</p>
									)}

									{userTalk.attempts.length > 0 && (
										<div className="space-y-2">
											<Separator />
											<p className="text-sm font-semibold">Último intento</p>
											<div className="text-muted-foreground space-y-1 text-sm">
												<p>
													Puntuación: {userTalk.attempts[0].score}/{userTalk.minRequiredScore} (
													{((userTalk.attempts[0].score / userTalk.minRequiredScore) * 100).toFixed(
														0
													)}
													%)
												</p>
												<p>Fecha: {formatDateTime(userTalk.attempts[0].completedAt)}</p>
												{userTalk.approvalBy && <p>Aprobado por: {userTalk.approvalBy.name}</p>}
											</div>
										</div>
									)}
								</div>
							)}

							<Button
								asChild
								className={cn(
									"w-full bg-teal-600 text-white hover:bg-teal-700 hover:text-white",
									isPassed && "bg-emerald-600 hover:bg-emerald-700"
								)}
								disabled={isDisabled}
							>
								<Link
									href={talk.href}
									className="flex h-full w-full items-center justify-center px-4 py-2 font-semibold tracking-wide"
								>
									{actionLabel}
								</Link>
							</Button>
						</CardContent>
					</Card>
				)
			})}
		</div>
	)
}

type StatusBadgesProps = {
	isBlocked?: boolean
	isExpired: boolean
	isFailed?: boolean
	isInProgress?: boolean
	isPassed: boolean
}

function StatusBadges({
	isBlocked,
	isExpired,
	isFailed,
	isInProgress,
	isPassed,
}: StatusBadgesProps) {
	return (
		<div className="flex flex-col items-end gap-2 text-xs">
			{isPassed && !isExpired && <Badge className="bg-emerald-600">Aprobada</Badge>}
			{isExpired && <Badge variant="destructive">Expirada</Badge>}
			{isBlocked && <Badge variant="destructive">Bloqueada</Badge>}
			{isInProgress && <Badge variant="secondary">En progreso</Badge>}
			{isFailed && <Badge variant="destructive">Reprobada</Badge>}
		</div>
	)
}
