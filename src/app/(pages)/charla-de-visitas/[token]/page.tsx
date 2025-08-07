"use client"

import { useParams, useSearchParams } from "next/navigation"
import { ExternalLinkIcon, FootprintsIcon, PlayCircleIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import VisitorDataForm from "@/project/safety-talk/components/forms/VisitorDataForm"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

type VisitorTalkData = {
	id: string
	videoUrl: string
	company: {
		id: string
		name: string
		rut: string
		emails: string[]
	}
	expiresAt: string | null
}

export default function VisitorTalkPage() {
	const params = useParams()
	const searchParams = useSearchParams()
	const token = params.token as string
	const email = searchParams.get("email")

	const [loading, setLoading] = useState(true)
	const [talkData, setTalkData] = useState<VisitorTalkData | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [step, setStep] = useState<"form" | "video">("form")

	const fetchTalkData = useCallback(async () => {
		try {
			const response = await fetch(`/api/visitor-talks/${token}`)
			const result = await response.json()

			if (!result.ok) {
				setError(result.message || "Error al cargar la charla")
				return
			}

			if (!result.data.company.emails.includes(email)) {
				setError("Tu email no está autorizado para acceder a esta charla")
				return
			}

			setTalkData(result.data)
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

		fetchTalkData()
	}, [token, email, fetchTalkData])

	function handleFormSuccess() {
		setStep("video")
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
		<div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-8">
			<div className="mx-auto max-w-4xl">
				<div className="mb-6 text-center">
					<h1 className="text-text mb-2 text-3xl font-bold">
						Charla de Seguridad - {talkData.company.name}
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
					<div className="space-y-6">
						<Card className="bg-secondary-background">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<PlayCircleIcon className="h-5 w-5" />
									Video de Charla de Seguridad
								</CardTitle>
								<CardDescription>
									Haz clic en el botón de abajo para abrir el video en una nueva pestaña.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button
									size="lg"
									onClick={openVideoInNewTab}
									className="w-full font-medium tracking-wide"
								>
									Abrir Video de Charla
									<ExternalLinkIcon className="h-5 w-5" />
								</Button>
							</CardContent>
						</Card>

						<Card className="bg-secondary-background">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FootprintsIcon className="h-5 w-5" />
									Próximos Pasos
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-muted-foreground space-y-2 text-sm">
									<p>• Ve el video completo de la charla de seguridad</p>
									<p>• Al finalizar, podrás responder las preguntas de evaluación</p>
									<p>• Una vez aprobado, recibirás tu certificado de participación</p>
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	)
}
