import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/lib/utils"

import type { UserSafetyTalk } from "@prisma/client"

interface SafetyTalkListProps {
	userSafetyTalks: UserSafetyTalk[]
}

export function SafetyTalkList({ userSafetyTalks }: SafetyTalkListProps) {
	const safetyTalks = [
		{
			id: "environmental",
			title: "Medio Ambiente",
			description: "Charla sobre prácticas ambientales y manejo de residuos",
			category: "ENVIRONMENT",
		},
		{
			id: "irl",
			title: "Introducción a Riesgos Laborales",
			description: "Charla sobre riesgos laborales básicos y prevención",
			category: "IRL",
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

				return (
					<Card key={talk.id} className={cn(isPassed && "border-green-200 bg-green-50")}>
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
						<CardContent>
							{isPassed && userTalk?.expiresAt && (
								<p className="text-muted-foreground text-sm">
									Expira el: {new Date(userTalk.expiresAt).toLocaleDateString()}
								</p>
							)}
							{hasFailedAttempts && nextAttemptAt && (
								<p className="text-muted-foreground text-sm">
									Próximo intento disponible: {new Date(nextAttemptAt).toLocaleString()}
								</p>
							)}
							<div className="mt-4">
								{/* <Button
									asChild
									className="w-full"
									variant={isPassed ? "outline" : "default"}
									disabled={
										isBlocked ||
										isInProgress ||
										(hasFailedAttempts && nextAttemptAt && new Date(nextAttemptAt) > new Date())
									}
								>
									<Link href={`/dashboard/charlas-de-seguridad/${talk.id}`}>
										{isPassed ? "Ver Detalles" : "Realizar Charla"}
									</Link>
								</Button> */}
							</div>
						</CardContent>
					</Card>
				)
			})}
		</div>
	)
}
