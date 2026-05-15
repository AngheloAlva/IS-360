"use client"

import { CheckCircle2, XCircle, Download, Calendar, ChevronLeftIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"

import { generateCertificate, generateExternalCertificate } from "../actions/generate-certificate"

import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { EvaluationFeedback } from "./EvaluationFeedback"
import { Button } from "@/shared/components/ui/button"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

import type { Question, TrueFalseQuestion } from "../utils/questions-loader"
import type { SAFETY_TALK_CATEGORY } from "@/generated/prisma/enums"

interface EvaluationResultProps {
	score: number
	passed: boolean
	expiresAt?: Date
	email?: string
	attemptNumber?: number
	invitationToken?: string
	userSafetyTalkId?: string
	nextAttemptAt?: Date | null
	isPermanentlyBlocked?: boolean
	category: SAFETY_TALK_CATEGORY
	validatedAnswers?: Array<{
		questionId: number
		answer: string
		isCorrect: boolean
		isTrueFalse?: boolean
	}>
	questions?: Question[]
	trueFalseQuestions?: TrueFalseQuestion[]
	correctAnswersMap?: Record<number, string>
}

export function EvaluationResult({
	score,
	email,
	passed,
	category,
	expiresAt,
	invitationToken,
	userSafetyTalkId,
	validatedAnswers,
	questions = [],
	trueFalseQuestions = [],
	correctAnswersMap = {},
}: EvaluationResultProps) {
	const [isDownloading, setIsDownloading] = useState(false)

	const handleDownloadCertificate = async () => {
		setIsDownloading(true)
		try {
			const result =
				invitationToken && email
					? await generateExternalCertificate(invitationToken, email)
					: await generateCertificate(userSafetyTalkId!)

			if (result.success && result.pdf) {
				const blob = base64ToBlob(result.pdf, "application/pdf")
				const url = URL.createObjectURL(blob)
				const link = document.createElement("a")
				link.href = url
				link.download = result.filename || "certificado.pdf"
				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)
				URL.revokeObjectURL(url)
				toast.success("Certificado descargado exitosamente")
			} else {
				toast.error(result.error || "Error al generar el certificado")
			}
		} catch (error) {
			console.error("Error downloading certificate:", error)
			toast.error("Error al descargar el certificado")
		} finally {
			setIsDownloading(false)
		}
	}

	const base64ToBlob = (base64: string, type: string) => {
		const byteCharacters = atob(base64)
		const byteNumbers = new Array(byteCharacters.length)
		for (let i = 0; i < byteCharacters.length; i++) {
			byteNumbers[i] = byteCharacters.charCodeAt(i)
		}
		const byteArray = new Uint8Array(byteNumbers)
		return new Blob([byteArray], { type })
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center gap-4">
						{passed ? (
							<div className="flex h-16 w-16 items-center justify-center rounded-lg bg-green-500/20">
								<CheckCircle2 className="h-10 w-10 text-green-500" />
							</div>
						) : (
							<div className="flex h-16 w-16 items-center justify-center rounded-lg bg-red-500/20">
								<XCircle className="h-10 w-10 text-red-500" />
							</div>
						)}
						<div>
							<CardTitle className={passed ? "text-lg text-green-500" : "text-lg text-red-500"}>
								{passed ? "¡Felicitaciones!" : "No Aprobado"}
							</CardTitle>
							<CardDescription>
								{passed
									? "Has completado exitosamente la evaluación"
									: "No has alcanzado el puntaje mínimo requerido"}
							</CardDescription>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					<div className="bg-muted rounded-lg p-4">
						<div className="flex items-center justify-between">
							<span className="text-base font-semibold">Puntaje Obtenido</span>
							<span className="text-xl font-bold">{score.toFixed(1)}%</span>
						</div>
						<div className="text-muted-foreground mt-2 text-sm">
							{category === "IRL"
								? "Puntaje mínimo requerido: 100%"
								: "Puntaje mínimo requerido: 70%"}
						</div>
					</div>

					{!passed && (
						<Alert>
							<AlertDescription>
								Puedes intentar nuevamente de inmediato. Revisa el material de la charla y vuelve a
								intentarlo.
							</AlertDescription>
						</Alert>
					)}

					{passed && expiresAt && (
						<Alert>
							<Calendar className="h-4 w-4" />
							<AlertDescription className="text-text">
								Este certificado es válido hasta el{" "}
								{new Date(expiresAt).toLocaleDateString("es-CL", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</AlertDescription>
						</Alert>
					)}

					{passed && (
						<Button
							onClick={handleDownloadCertificate}
							disabled={isDownloading}
							className="hover:bg-primary w-full"
							size="lg"
						>
							<Download className="mr-2 h-4 w-4" />
							{isDownloading ? "Generando certificado..." : "Descargar Certificado"}
						</Button>
					)}
				</CardContent>
			</Card>

			{validatedAnswers && validatedAnswers.length > 0 && (
				<EvaluationFeedback
					answers={validatedAnswers}
					questions={questions}
					trueFalseQuestions={trueFalseQuestions}
					correctAnswersMap={correctAnswersMap}
				/>
			)}

			<div className="flex justify-center">
				{passed ? (
					<div className="flex flex-col items-center gap-4">
						<span>
							Gracias por tu participación. Puedes descargar el certificado y volver a la página de
							charlas de seguridad.
						</span>

						<Link href="/dashboard/charlas-de-seguridad">
							<Button variant="outline" size={"lg"}>
								<ChevronLeftIcon className="h-4 w-4" />
								Volver
							</Button>
						</Link>
					</div>
				) : (
					<Button variant="outline" onClick={() => window.location.reload()}>
						Intentar Nuevamente
					</Button>
				)}
			</div>
		</div>
	)
}
