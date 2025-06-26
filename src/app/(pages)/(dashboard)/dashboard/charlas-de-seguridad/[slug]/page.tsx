import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { notFound } from "next/navigation"
import { Calendar, Check, FileText, Play, Timer } from "lucide-react"

import { getSafetyTalkByCategory } from "@/project/safety-talk/actions/get-safety-talks"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Separator } from "@/shared/components/ui/separator"

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
		<div className="space-y-6">
			<div className="flex flex-col justify-between gap-4 lg:flex-row">
				<div>
					<div className="mb-1 flex items-center gap-2">
						<h1 className="text-2xl font-bold">{safetyTalkInfo.title}</h1>
						{isPassed && <Badge className="bg-green-600">Aprobada</Badge>}
						{isBlocked && <Badge variant="destructive">Bloqueada</Badge>}
						{isInProgress && <Badge variant="secondary">En Progreso</Badge>}
						{hasFailedAttempts && <Badge variant="destructive">Reprobada</Badge>}
					</div>
					<p className="text-muted-foreground">{safetyTalkInfo.description}</p>
				</div>

				<div className="flex gap-3">
					<Button
						className="gap-2"
						asChild
						disabled={Boolean(
							isBlocked ||
								isInProgress ||
								(hasFailedAttempts && nextAttemptAt && new Date(nextAttemptAt) > new Date())
						)}
					>
						<Link href={`/dashboard/charlas-de-seguridad/${slug}/realizar`}>
							<Play className="h-4 w-4" />
							{isPassed ? "Ver Detalles" : "Realizar Charla"}
						</Link>
					</Button>

					<Button variant="outline" className="gap-2" asChild>
						<Link href="/dashboard/charlas-de-seguridad">Volver</Link>
					</Button>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<div className="space-y-4">
					<div>
						<h2 className="mb-4 text-xl font-semibold">Información de la charla</h2>
						<div className="space-y-3">
							<div className="text-muted-foreground flex items-center gap-2">
								<Check className="h-5 w-5 text-green-600" />
								<span>Puntaje mínimo requerido: {safetyTalkInfo.minScore}%</span>
							</div>

							<div className="text-muted-foreground flex items-center gap-2">
								<Timer className="h-5 w-5 text-blue-600" />
								<span>Tiempo límite: 30 minutos</span>
							</div>

							{userSafetyTalk?.expiresAt && (
								<div className="text-muted-foreground flex items-center gap-2">
									<Calendar className="h-5 w-5 text-amber-600" />
									<span>
										Fecha de vencimiento:{" "}
										{format(new Date(userSafetyTalk.expiresAt), "dd 'de' MMMM, yyyy", {
											locale: es,
										})}
									</span>
								</div>
							)}

							<div className="text-muted-foreground flex items-center gap-2">
								<FileText className="h-5 w-5 text-indigo-600" />
								<span>Cantidad de preguntas: 10</span>
							</div>
						</div>
					</div>
				</div>

				<div>
					<h2 className="mb-4 text-xl font-semibold">Recursos disponibles</h2>
					<div className="space-y-3">
						<div className="flex items-center gap-3 rounded-md border p-3">
							<div className="rounded-md bg-blue-100 p-2 text-blue-700">
								<FileText className="h-5 w-5" />
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

			<div>
				<h2 className="mb-4 text-xl font-semibold">Instrucciones</h2>
				<div className="space-y-4">
					<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
						<h3 className="mb-2 font-medium text-blue-800">Antes de comenzar</h3>
						<ul className="list-disc space-y-1 pl-5 text-sm text-blue-700">
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
								<Button size="lg" className="gap-2" asChild>
									<Link href={`/dashboard/charlas-de-seguridad/${slug}/realizar`}>
										<Play className="h-4 w-4" />
										Comenzar charla
									</Link>
								</Button>
							</div>
						)}
				</div>
			</div>
		</div>
	)
}
