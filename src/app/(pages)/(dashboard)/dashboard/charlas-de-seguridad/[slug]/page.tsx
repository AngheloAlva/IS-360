import { CheckIcon, FileTextIcon, PlayIcon, TimerIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import Link from "next/link"

import { getSafetyTalkByCategory } from "@/project/safety-talk/actions/get-safety-talks"

import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Separator } from "@/shared/components/ui/separator"
import BackButton from "@/shared/components/BackButton"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"

export default async function SafetyTalkDetailsPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const category = slug === "environmental" ? "ENVIRONMENT" : "IRL"
	const userSafetyTalk = await getSafetyTalkByCategory(category as "ENVIRONMENT" | "IRL")

	const safetyTalkInfo = {
		environmental: {
			title: "Medio Ambiente",
			description: "Charla sobre prácticas ambientales y manejo de residuos",
			minScore: 70,
		},
		irl: {
			title: "Introducción a Riesgos Laborales",
			description: "Charla sobre riesgos laborales básicos y prevención",
			minScore: 70,
		},
	}[slug]

	if (!safetyTalkInfo) {
		notFound()
	}

	const isExpired = userSafetyTalk?.expiresAt && new Date(userSafetyTalk.expiresAt) < new Date()
	const isPassed = userSafetyTalk?.status === "PASSED" && !isExpired
	const isBlocked = userSafetyTalk?.status === "BLOCKED"
	const isInProgress = userSafetyTalk?.status === "IN_PROGRESS"
	const hasFailedAttempts = userSafetyTalk?.status === "FAILED"
	const nextAttemptAt = userSafetyTalk?.nextAttemptAt

	return (
		<div className="w-full max-w-screen-lg space-y-6">
			<div className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-sky-700 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<BackButton
							href="/dashboard/charlas-de-seguridad"
							className="bg-white/30 text-white hover:bg-white/50"
						/>

						<div className="flex flex-col items-start">
							<h1 className="text-2xl font-bold text-white">{safetyTalkInfo.title}</h1>
							<p className="text-white">{safetyTalkInfo.description}</p>
						</div>
					</div>

					{isPassed && <Badge className="bg-emerald-600">Aprobada</Badge>}
					{isBlocked && <Badge variant="destructive">Bloqueada</Badge>}
					{isInProgress && <Badge variant="secondary">En Progreso</Badge>}
					{hasFailedAttempts && <Badge variant="destructive">Reprobada</Badge>}
				</div>
			</div>

			<div className="bg-background grid gap-6 rounded-lg p-4 md:grid-cols-2">
				<div className="space-y-4">
					<div>
						<h2 className="mb-4 text-xl font-semibold">Información de la charla</h2>
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<CheckIcon className="h-5 w-5 text-emerald-600" />
								<span>Puntaje mínimo requerido: {safetyTalkInfo.minScore}%</span>
							</div>

							<div className="flex items-center gap-2">
								<TimerIcon className="h-5 w-5 text-blue-600" />
								<span>Tiempo límite: 30 minutos</span>
							</div>

							<div className="flex items-center gap-2">
								<FileTextIcon className="h-5 w-5 text-indigo-600" />
								<span>Cantidad de preguntas: 10</span>
							</div>
						</div>
					</div>
				</div>

				<div>
					<h2 className="mb-4 text-xl font-semibold">Recursos disponibles</h2>
					<div className="space-y-3">
						<div className="bg-background flex items-center gap-3 rounded-lg border p-3">
							<div className="rounded-md bg-blue-500/10 p-2 text-blue-500">
								<FileTextIcon className="h-5 w-5" />
							</div>
							<div className="flex-grow">
								<p className="font-medium">Guía de {safetyTalkInfo.title}</p>
								<p className="text-muted-foreground text-sm">Documento PDF</p>
							</div>
							<Button size="sm" variant="outline" asChild>
								<Link href={`/docs/${slug}-guide.pdf`} target="_blank" rel="noopener noreferrer">
									Ver
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>

			<Separator />

			{isPassed ? (
				<div className="space-y-4">
					<Alert className="bg-emerald-600/10">
						<CheckIcon className="h-5 w-5" />
						<AlertTitle>¡Excelente!</AlertTitle>
						<AlertDescription>Has aprobado la charla.</AlertDescription>
					</Alert>

					<Card>
						<CardContent className="pt-6">
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-3">
									<div className="space-y-2">
										<p className="text-sm font-medium">Puntuación</p>
										<p className="text-2xl font-bold text-emerald-600">
											{userSafetyTalk?.score}/{100}
										</p>
										<p className="text-muted-foreground text-sm">
											{(((userSafetyTalk?.score || 0) / 100) * 100).toFixed(0)}%
										</p>
									</div>

									<div className="space-y-2">
										<p className="text-sm font-medium">Fecha de aprobación</p>
										<p className="text-2xl font-bold text-blue-600">
											{userSafetyTalk?.completedAt
												? format(new Date(userSafetyTalk.completedAt), "dd 'de' MMMM", {
														locale: es,
													})
												: "No disponible"}
										</p>
										<p className="text-muted-foreground text-sm">
											{userSafetyTalk?.completedAt
												? format(new Date(userSafetyTalk.completedAt), "yyyy", {
														locale: es,
													})
												: ""}
										</p>
									</div>

									<div className="space-y-2">
										<p className="text-sm font-medium">Fecha de vencimiento</p>
										<p className="text-2xl font-bold text-amber-600">
											{userSafetyTalk?.expiresAt
												? format(new Date(userSafetyTalk.expiresAt), "dd 'de' MMMM", {
														locale: es,
													})
												: "No disponible"}
										</p>
										<p className="text-muted-foreground text-sm">
											{userSafetyTalk?.expiresAt
												? format(new Date(userSafetyTalk.expiresAt), "yyyy", {
														locale: es,
													})
												: ""}
										</p>
									</div>
								</div>

								{userSafetyTalk?.approvalBy && (
									<p className="text-muted-foreground text-sm">
										Aprobado por: {userSafetyTalk.approvalBy.name}
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			) : (
				<div>
					<h2 className="mb-4 text-xl font-semibold">Instrucciones</h2>
					<div className="space-y-4">
						<div className="bg-background rounded-lg border p-4">
							<h3 className="mb-2 font-medium">Antes de comenzar</h3>
							<ul className="list-disc space-y-1 pl-5 text-sm">
								<li>
									Asegúrate de tener suficiente tiempo para completar la charla sin interrupciones.
								</li>
								<li>Revisa todos los materiales y recursos proporcionados.</li>
								<li>Necesitarás obtener al menos {safetyTalkInfo.minScore}% para aprobar.</li>
								<li>Tienes un límite de 30 minutos para completar la evaluación.</li>
							</ul>
						</div>

						{!isBlocked &&
							!isInProgress &&
							(!hasFailedAttempts || (nextAttemptAt && new Date(nextAttemptAt) <= new Date())) && (
								<div className="flex justify-center">
									<Button
										size="lg"
										className="gap-2 bg-teal-600 px-4 text-white hover:bg-teal-700 hover:text-white"
										asChild
									>
										<Link href={`/dashboard/charlas-de-seguridad/${slug}/realizar`}>
											<PlayIcon className="h-4 w-4" />
											Comenzar charla
										</Link>
									</Button>
								</div>
							)}
					</div>
				</div>
			)}
		</div>
	)
}
