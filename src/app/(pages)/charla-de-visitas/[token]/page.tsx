"use client"

import { ExternalLinkIcon, FootprintsIcon, CheckCircle2Icon, NotebookPenIcon } from "lucide-react"
import { useParams, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"

import { Card, CardTitle, CardHeader, CardContent } from "@/shared/components/ui/card"
import VisitorDataForm from "@/project/safety-talk/components/forms/VisitorDataForm"
import { getVisitorTalk } from "@/project/safety-talk/actions/get-visitor-talk"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"

import type { SAFETY_TALK_CATEGORY } from "@/generated/prisma/enums"

type VisitorTalkData = {
	id: string
	videoUrl: string
	category: SAFETY_TALK_CATEGORY
	company: {
		id: string
		name: string
		rut: string
		emails: string[]
	}
	expiresAt: Date | null
	visitor?: {
		id: string
		name: string
		rut: string
		email: string
	}
	completion?: {
		id: string
		status: string
		passed: boolean | null
		score: number | null
		completedAt: Date | null
	}
}

type Step = "form" | "video" | "evaluation" | "completed"

export default function VisitorTalkPage() {
	const params = useParams()
	const searchParams = useSearchParams()
	const token = params.token as string
	const email = searchParams.get("email")

	const [loading, setLoading] = useState(true)
	const [talkData, setTalkData] = useState<VisitorTalkData | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [step, setStep] = useState<Step>("form")

	const fetchTalkData = useCallback(async () => {
		if (!email) {
			setError("Email no proporcionado en el enlace")
			setLoading(false)
			return
		}

		try {
			const result = await getVisitorTalk(token, email)

			if (!result.success || !result.data) {
				setError(result.error || "Error al cargar la charla")
				return
			}

			setTalkData(result.data)

			if (result.data.completion?.passed) {
				setStep("completed")
			} else if (result.data.completion?.status === "COMPLETED") {
				setStep("completed")
			} else if (result.data.visitor?.name && result.data.visitor?.rut) {
				setStep("video")
			} else {
				setStep("form")
			}
		} catch (error) {
			console.error("Error fetching talk data:", error)
			setError("Error de conexión")
		} finally {
			setLoading(false)
		}
	}, [token, email])

	useEffect(() => {
		if (!token) {
			setError("Token de charla no válido")
			setLoading(false)
			return
		}

		if (!email) {
			setError("Email no proporcionado en el enlace")
			setLoading(false)
			return
		}

  void fetchTalkData()
	}, [token, email, fetchTalkData])

	function handleFormSuccess() {
		setStep("video")
  void fetchTalkData()
	}

	function getCategoryLabel(category: SAFETY_TALK_CATEGORY): string {
		switch (category) {
			case "VISITOR":
				return "Inducción Visitas Hualpén"
			case "VISITOR_TRM":
				return "Inducción Visitas El Avellano"
			case "IRL":
				return "Inducción de Riesgos Laborales"
			default:
				return category
		}
	}

	function openVideoInNewTab() {
		if (talkData?.videoUrl) {
			window.open(talkData.videoUrl, "_blank")
		}
	}

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
					<p>Cargando charla de seguridad...</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-red-600">Error de Acceso</CardTitle>
					</CardHeader>
					<CardContent>
						<Alert>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					</CardContent>
				</Card>
			</div>
		)
	}

	if (!talkData) {
		return null
	}

	return (
		<div className="bg-secondary-background flex min-h-screen flex-col items-center justify-center px-4 py-8">
			<div className="mx-auto max-w-4xl">
				<div className="mb-6 text-center">
					<h1 className="text-text mb-2 text-3xl font-bold">
						{getCategoryLabel(talkData.category)} - {talkData.company.name}
					</h1>
					{talkData.expiresAt && (
						<p className="text-muted-foreground text-sm">
							Disponible hasta: {new Date(talkData.expiresAt).toLocaleDateString()}
						</p>
					)}
				</div>

				{step === "form" && (
					<div className="flex justify-center">
						<VisitorDataForm
							token={token}
							email={email!}
							companyName={talkData.company.name}
							onSuccess={handleFormSuccess}
						/>
					</div>
				)}

				{step === "video" && (
					<div className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FootprintsIcon className="h-5 w-5" />
									Próximos Pasos
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-muted-foreground space-y-2 text-sm">
									<p>• Ve el video completo de la charla de seguridad</p>
									<p>• Responde las preguntas de evaluación (puntaje mínimo: 70%)</p>
									<p>• Una vez aprobado, podrás descargar tu certificado de participación</p>
								</div>
							</CardContent>
						</Card>

						<Button
							size="lg"
							onClick={openVideoInNewTab}
							className="hover:bg-primary/80 w-full font-semibold tracking-wide"
						>
							Abrir Video de Charla
							<ExternalLinkIcon className="h-5 w-5" />
						</Button>

						{email && (
							<Link
								href={`/evaluacion/${token}?email=${encodeURIComponent(email)}&category=${talkData.category}`}
							>
								<Button size="lg" variant="outline" className="w-full font-semibold tracking-wide">
									Ir a Evaluación
									<NotebookPenIcon className="h-5 w-5" />
								</Button>
							</Link>
						)}
					</div>
				)}

				{step === "completed" && talkData.completion && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<CheckCircle2Icon className="h-5 w-5 text-green-600" />
								Evaluación Completada
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{talkData.completion.passed ? (
								<>
									<div className="rounded-md bg-green-500/10 p-4 text-green-600">
										<p className="font-semibold">¡Felicitaciones! Has aprobado la evaluación</p>
										<p className="text-sm">Puntaje: {talkData.completion.score}%</p>
									</div>
									<Link
										href={`/evaluacion/${token}?email=${encodeURIComponent(email || "")}&category=${talkData.category}`}
									>
										<Button size="lg" className="w-full">
											Descargar Certificado
										</Button>
									</Link>
								</>
							) : (
								<div className="rounded-md bg-red-500/10 p-4 text-red-600">
									<p className="font-semibold">No has aprobado la evaluación</p>
									<p className="text-sm">Puntaje: {talkData.completion.score}%</p>
									<p className="mt-2 text-sm">Contacta al administrador para más información.</p>
								</div>
							)}
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	)
}
