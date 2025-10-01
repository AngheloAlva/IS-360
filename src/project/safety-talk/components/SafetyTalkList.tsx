import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/lib/utils"
import { Separator } from "@/shared/components/ui/separator"
import { Button } from "@/shared/components/ui/button"
import Link from "next/link"

import type { UserSafetyTalk } from "@prisma/client"

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

export function SafetyTalkList({ userSafetyTalks }: SafetyTalkListProps) {
	const safetyTalks = [
		{
			id: "environmental",
			title: "Medio Ambiente",
			description: "Charla sobre prácticas ambientales y manejo de residuos",
			category: "ENVIRONMENT",
			disabled: false,
		},
		{
			id: "irl",
			title: "Introducción a Riesgos Laborales",
			description: "Charla sobre riesgos laborales básicos y prevención",
			category: "IRL",
			disabled: true,
		},
	]

	return (
		<div className="grid gap-4 md:grid-cols-2">
			{safetyTalks.map((talk) => {
				const userTalk = userSafetyTalks.find((ut) => ut.category === talk.category)
				const isExpired = userTalk?.expiresAt && new Date(userTalk.expiresAt) < new Date()
				const isPassed = userTalk?.status === "PASSED" && !isExpired
				const isBlocked = userTalk?.status === "BLOCKED"
				const isInProgress = userTalk?.status === "IN_PROGRESS"
				const hasFailedAttempts = userTalk?.status === "FAILED"
				const nextAttemptAt = userTalk?.nextAttemptAt
				const isDisabled: boolean =
					talk.disabled ||
					isBlocked ||
					isInProgress ||
					hasFailedAttempts ||
					isExpired ||
					!nextAttemptAt

				return (
					<Card key={talk.id} className={cn(isPassed && "border-green-500/20")}>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle>{talk.title}</CardTitle>
								{isPassed && <Badge className="bg-green-600">Aprobada</Badge>}
								{isBlocked && <Badge variant="destructive">Bloqueada</Badge>}
								{isInProgress && <Badge variant="secondary">En Progreso</Badge>}
								{hasFailedAttempts && <Badge variant="destructive">Reprobada</Badge>}
							</div>
							<CardDescription>{talk.description}</CardDescription>
						</CardHeader>

						<CardContent className="mt-auto">
							{userTalk && (
								<div className="mb-4 space-y-4">
									{/* Información de expiración */}
									{isPassed && userTalk.expiresAt && (
										<p className="text-muted-foreground text-sm">
											Expira el: {new Date(userTalk.expiresAt).toLocaleDateString()}
										</p>
									)}

									{/* Información de próximo intento */}
									{hasFailedAttempts && nextAttemptAt && (
										<p className="text-muted-foreground text-sm">
											Próximo intento disponible: {new Date(nextAttemptAt).toLocaleString()}
										</p>
									)}

									{/* Detalles del último intento */}
									{userTalk.attempts.length > 0 && (
										<div className="space-y-2">
											<Separator />
											<p className="text-sm font-medium">Último intento:</p>
											<div className="text-muted-foreground space-y-1 text-sm">
												<p>
													Puntuación: {userTalk.attempts[0].score}/{userTalk.minRequiredScore} (
													{((userTalk.attempts[0].score / userTalk.minRequiredScore) * 100).toFixed(
														0
													)}
													%)
												</p>
												<p>Fecha: {userTalk.attempts[0].completedAt?.toLocaleString()}</p>
												{userTalk.approvalBy && <p>Aprobado por: {userTalk.approvalBy.name}</p>}
											</div>
										</div>
									)}
								</div>
							)}

							<div className="mt-4">
								<Button
									className={cn(
										"w-full bg-teal-600 px-0 py-0 text-white hover:bg-teal-700 hover:text-white",
										isPassed && "bg-emerald-600 hover:bg-emerald-700"
									)}
									disabled={isDisabled}
								>
									<Link
										href={`/dashboard/charlas-de-seguridad/${talk.id}`}
										className="flex h-full w-full items-center justify-center font-semibold tracking-wider"
									>
										{isPassed ? "Ver Detalles" : "Realizar Charla"}
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				)
			})}

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Charla de Visitas</CardTitle>
					</div>
					<CardDescription>
						Recorrido virtual por la planta IS 360 con información de seguridad. Puedes realizarla
						en cualquier momento las veces que desees.
					</CardDescription>
				</CardHeader>

				<CardContent className="mt-auto">
					<Button
						className={cn(
							"w-full bg-teal-600 px-0 py-0 text-white hover:bg-teal-700 hover:text-white"
						)}
					>
						<Link
							href={`/dashboard/charlas-de-seguridad/visitas`}
							className="flex h-full w-full items-center justify-center font-semibold tracking-wider"
						>
							Ver Charla
						</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
