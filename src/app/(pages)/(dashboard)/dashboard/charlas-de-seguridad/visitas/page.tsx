"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import {
	ClockIcon,
	XCircleIcon,
	LightbulbIcon,
	PlayCircleIcon,
	CheckCircle2Icon,
	AlertTriangleIcon,
} from "lucide-react"

import { getUserSafetyTalkStatus } from "@/project/safety-talk/actions/unblock-user"
import { SAFETY_TALK_CATEGORY } from "@/generated/prisma/enums"
import { authClient } from "@/lib/auth-client"

import MemoizedModuleHeader from "@/shared/components/ModuleHeader"
import { Button } from "@/shared/components/ui/button"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
} from "@/shared/components/ui/dialog"
import {
	AlertDialog,
	AlertDialogTitle,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogDescription,
} from "@/shared/components/ui/alert-dialog"
import { Separator } from "@/shared/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs"

const VISITOR_TALKS = [
	{
		value: "prs",
		category: SAFETY_TALK_CATEGORY.VISITOR,
		triggerLabel: "Inducción Visitas Hualpén",
		title: "Charla de Visitas Hualpén",
		subtitle: "Conoce los protocolos de seguridad antes de ingresar a Planta Hualpén.",
		image: {
			src: "/images/visitor-talk-front.png",
			alt: "Introducción a la charla de visitas Hualpén",
		},
		video: {
			src: "https://drive.google.com/file/d/1E4DVzsswWu2GfXNGqRTdAgIjWPLt1Zty/preview",
			title: "Charla de Seguridad para Visitas Hualpén",
		},
		evaluationLabel: "Realizar evaluación",
		instructions: [
			"Visualiza el video completo para conocer los requisitos de ingreso y permanencia.",
			"Verifica que cuentas con los elementos de protección personal obligatorios.",
			"Finaliza revisando los puntos de emergencia indicados durante la charla.",
		],
	},
	{
		value: "trm",
		category: SAFETY_TALK_CATEGORY.VISITOR_TRM,
		triggerLabel: "Inducción Visitas El Avellano",
		title: "Charla de Visitas El Avellano",
		subtitle: "Protocolos y zonas seguras para trabajar en El Avellano.",
		image: {
			src: "/images/visitor-talk-front-trm.png",
			alt: "Introducción a la charla de visitas El Avellano",
		},
		video: {
			src: "https://drive.google.com/file/d/18JdWOulPeWZ3nlNQbTRm6-KLCvIrJ0kO/preview",
			title: "Charla de Seguridad para Visitas El Avellano",
		},
		evaluationLabel: "Realizar evaluación",
		instructions: [
			"Revisa las áreas críticas señaladas y los procedimientos de reporte de emergencias.",
			"Confirma el uso correcto de los equipos de protección individual indicados.",
			"Planifica tu recorrido considerando las rutas de evacuación mostradas.",
		],
	},
]

type TalkStatus = {
	status: string
	score: number | null
	expiresAt: Date | null
	nextAttemptAt: Date | null
	currentAttempts: number
}

export default function VisitorSafetyTalksPage() {
	const router = useRouter()
	const { data: session } = authClient.useSession()
	const [statuses, setStatuses] = useState<Record<string, TalkStatus | null>>({})
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const loadStatuses = async () => {
			if (!session?.user?.id) {
				setIsLoading(false)
				return
			}

			setIsLoading(true)
			const results: Record<string, TalkStatus | null> = {}

			for (const talk of VISITOR_TALKS) {
				const response = await getUserSafetyTalkStatus(session.user.id, talk.category)
				if (response.success && response.status) {
					results[talk.value] = {
						status: response.status.status,
						score: response.status.score,
						expiresAt: response.status.expiresAt,
						nextAttemptAt: response.status.nextAttemptAt,
						currentAttempts: response.status.currentAttempts,
					}
				} else {
					results[talk.value] = null
				}
			}

			setStatuses(results)
			setIsLoading(false)
		}

		void loadStatuses()
	}, [session?.user?.id])

	return (
		<div className="w-full flex-1 space-y-6">
			<MemoizedModuleHeader
				backHref="/dashboard/charlas-de-seguridad"
				className="from-sky-600 to-indigo-700 dark:from-sky-800 dark:to-indigo-900"
				title="Charlas de Visita - Interno"
				description="Selecciona la planta correspondiente, visualiza el video y rinde la evaluación."
			/>

			<Tabs defaultValue={VISITOR_TALKS[0].value}>
				<TabsList className="w-full">
					{VISITOR_TALKS.map((talk) => (
						<TabsTrigger key={talk.value} value={talk.value} className="px-4 py-2 text-sm">
							{talk.triggerLabel}
						</TabsTrigger>
					))}
				</TabsList>

				{VISITOR_TALKS.map((talk) => {
					const talkStatus = statuses[talk.value] ?? null

					return (
						<TabsContent key={talk.value} value={talk.value} className="mt-6 space-y-6">
							<section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
								<div className="space-y-6">
									<Dialog>
										<DialogTrigger className="relative flex h-130 w-full items-center justify-center overflow-hidden rounded-lg">
											<Image
												fill
												priority
												alt={talk.image.alt}
												src={talk.image.src}
												className="object-cover"
											/>
											<div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
											<div className="text-text absolute z-10 flex flex-col items-center gap-2 text-center">
												<PlayCircleIcon className="size-14 text-sky-400 drop-shadow" />
												<span className="text-lg font-semibold">Ver video</span>
												<span className="text-text/80 text-sm font-semibold">{talk.title}</span>
											</div>
										</DialogTrigger>

										<DialogContent className="sm:max-w-5xl">
											<DialogHeader>
												<DialogTitle>{talk.video.title}</DialogTitle>
											</DialogHeader>
											<div className="aspect-video overflow-hidden rounded-md">
												<iframe
													src={talk.video.src}
													allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
													allowFullScreen
													className="h-full w-full"
												/>
											</div>
										</DialogContent>
									</Dialog>

									<article className="bg-background/80 rounded-lg border p-6 shadow-sm">
										<h2 className="text-foreground text-xl font-semibold">{talk.subtitle}</h2>
										<p className="text-muted-foreground mt-3 text-sm">
											Antes de iniciar la evaluación asegúrate de considerar los siguientes puntos:
										</p>
										<ul className="text-muted-foreground mt-4 list-disc space-y-2 pl-5 text-sm">
											{talk.instructions.map((item) => (
												<li key={item}>{item}</li>
											))}
										</ul>
									</article>
								</div>

								<aside className="bg-background/70 flex h-fit flex-col gap-4 rounded-lg border p-6 shadow-sm">
									<div className="bg-card rounded-lg border p-3">
										{isLoading ? (
											<p className="text-muted-foreground text-sm">
												Cargando estado de evaluación...
											</p>
										) : !talkStatus ? (
											<p className="text-muted-foreground text-sm">
												Aún no has realizado intentos de evaluación.
											</p>
										) : (
											<div className="space-y-2 text-sm">
												<p className="font-semibold">Estado actual de tu evaluación</p>
												<div className="flex items-center gap-2">
													{talkStatus.status === "PASSED" ? (
														<CheckCircle2Icon className="h-4 w-4 text-emerald-600" />
													) : talkStatus.status === "FAILED" || talkStatus.status === "BLOCKED" ? (
														<XCircleIcon className="h-4 w-4 text-red-600" />
													) : (
														<ClockIcon className="h-4 w-4 text-amber-600" />
													)}
													<span>
														{talkStatus.status === "PASSED"
															? "Aprobada"
															: talkStatus.status === "FAILED"
																? "Reprobada"
																: talkStatus.status === "BLOCKED"
																	? "Bloqueada"
																	: "En progreso"}
													</span>
												</div>
												{typeof talkStatus.score === "number" && (
													<p className="text-muted-foreground">
														Puntaje: {talkStatus.score.toFixed(1)}%
													</p>
												)}
												<p className="text-muted-foreground">
													Intentos: {talkStatus.currentAttempts}/3
												</p>
												{talkStatus.expiresAt && talkStatus.status === "PASSED" && (
													<p className="text-muted-foreground">
														Vigente hasta:{" "}
														{new Date(talkStatus.expiresAt).toLocaleDateString("es-CL")}
													</p>
												)}
												{talkStatus.nextAttemptAt && (
													<p className="text-muted-foreground">
														Próximo intento:{" "}
														{new Date(talkStatus.nextAttemptAt).toLocaleString("es-CL")}
													</p>
												)}
											</div>
										)}
									</div>

									<div>
										<h3 className="text-foreground text-lg font-semibold">
											¿Listo para continuar?
										</h3>
										<p className="text-muted-foreground mt-2 text-sm">
											Completa la charla y luego inicia la evaluación para registrar tu
											acreditación.
										</p>
									</div>

									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												size="lg"
												className="w-full bg-teal-600 font-semibold text-white hover:bg-teal-700 dark:bg-teal-800 dark:hover:bg-teal-900"
											>
												{talk.evaluationLabel}
											</Button>
										</AlertDialogTrigger>

										<AlertDialogContent className="max-w-2xl">
											<AlertDialogHeader>
												<AlertDialogTitle className="flex items-center gap-2 text-xl">
													<AlertTriangleIcon className="h-6 w-6 text-orange-500" />
													Instrucciones Importantes - Leer Antes de Comenzar
												</AlertDialogTitle>
												<AlertDialogDescription className="space-y-4 text-left">
													<div className="mt-4">
														<p className="text-foreground text-base font-semibold">
															Condiciones de la evaluación:
														</p>
														<ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
															<li>
																<strong>Puntaje mínimo:</strong> 70% para aprobar
															</li>
															<li>
																<strong>Obligatorio:</strong> Debes responder TODAS las preguntas
															</li>
														</ul>
													</div>

													<Separator />

													<div>
														<p className="text-text mb-1 flex items-center gap-1 text-sm font-semibold">
															<LightbulbIcon className="h-5 w-5" /> Recomendaciones:
														</p>
														<ul className="list-inside list-disc space-y-1 text-xs">
															<li>Asegúrate de tener buena conexión a internet</li>
															<li>Busca un lugar tranquilo sin interrupciones</li>
															<li>Revisa el video de la charla antes de comenzar</li>
															<li>Ten a mano tus apuntes si los tomaste</li>
														</ul>
													</div>
												</AlertDialogDescription>
											</AlertDialogHeader>

											<AlertDialogFooter className="mt-2">
												<AlertDialogCancel>Cancelar</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => {
														router.push(
															`/dashboard/charlas-de-seguridad/evaluacion/${talk.category}`
														)
													}}
													className="bg-teal-600 hover:bg-teal-700"
												>
													Entiendo, Comenzar Evaluación
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>

									<p className="text-muted-foreground text-xs">
										Necesitas obtener al menos el 70% de logro para aprobar. Puedes intentar las
										veces que necesites.
									</p>
								</aside>
							</section>
						</TabsContent>
					)
				})}
			</Tabs>
		</div>
	)
}
