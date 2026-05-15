"use client"

import { Loader2Icon, AlertCircleIcon, ChevronLeftIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

import { getUserSafetyTalkStatus } from "@/project/safety-talk/actions/unblock-user"
import {
	getCorrectAnswersMap,
	getQuestionsByCategory,
	getIRLTrueFalseQuestions,
} from "@/project/safety-talk/utils/questions-loader"

import { EvaluationResult } from "@/project/safety-talk/components/EvaluationResult"
import { EvaluationForm } from "@/project/safety-talk/components/EvaluationForm"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

import { type SAFETY_TALK_CATEGORY, SAFETY_TALK_STATUS } from "@/generated/prisma/enums"

type Step = "loading" | "blocked" | "evaluation" | "result"

export default function EvaluationPage() {
	const params = useParams()
	const router = useRouter()
	const { data: session } = authClient.useSession()
	const category = params.category as SAFETY_TALK_CATEGORY

	const [step, setStep] = useState<Step>("loading")
	const [status, setStatus] = useState<{
		id: string
		status: SAFETY_TALK_STATUS
		score: number | null
		nextAttemptAt: Date | null
		currentAttempts: number
		expiresAt: Date | null
	} | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [result, setResult] = useState<{
		passed: boolean
		score: number
		validatedAnswers?: Array<{
			questionId: number
			answer: string
			isCorrect: boolean
			isTrueFalse?: boolean
		}>
	} | null>(null)
	const [selectedQuestions, setSelectedQuestions] = useState<
		ReturnType<typeof getQuestionsByCategory>
	>([])
	const [selectedTrueFalseQuestions, setSelectedTrueFalseQuestions] = useState<
		ReturnType<typeof getIRLTrueFalseQuestions>
	>([])

	const loadStatus = useCallback(async () => {
		if (!session?.user?.id) return

		try {
			// Cargar preguntas primero
			const questions = getQuestionsByCategory(category)
			const trueFalseQuestions = category === "IRL" ? getIRLTrueFalseQuestions() : []

			// Si no hay preguntas para esta categoría, mostrar error
			if (questions.length === 0) {
				setError("No hay preguntas disponibles para esta categoría.")
				return
			}

			setSelectedQuestions(questions)
			setSelectedTrueFalseQuestions(trueFalseQuestions)

			const response = await getUserSafetyTalkStatus(session.user.id, category)

			if (!response.success) {
				setError(response.error || "Error al cargar el estado")
				return
			}

			const userStatus = response.status

			if (!userStatus) {
				setStep("evaluation")
				return
			}

			// Check if the safety talk has expired
			const isExpired = userStatus.expiresAt && new Date(userStatus.expiresAt) < new Date()

			// If status is PASSED but the talk is expired, allow retaking the evaluation
			if (userStatus.status === "PASSED" && !isExpired) {
				setResult({ passed: true, score: userStatus.score || 0 })
				setStatus(userStatus)
				setStep("result")
				return
			}

			// If expired, reset the status to allow new evaluation
			if (isExpired) {
				// User can retake the evaluation
				setStatus(userStatus)
				setStep("evaluation")
				return
			}

			setStatus(userStatus)
			setStep("evaluation")
		} catch (error) {
			console.error("Error loading status:", error)
			setError("Error al cargar el estado")
		}
	}, [session, category])

	useEffect(() => {
		void loadStatus()
	}, [session, category, loadStatus, router])

	const handleEvaluationComplete = (evaluationResult: {
		passed: boolean
		score: number
		validatedAnswers?: Array<{
			questionId: number
			answer: string
			isCorrect: boolean
			isTrueFalse?: boolean
		}>
	}) => {
		setResult(evaluationResult)
		setStep("result")
	}

	const getCategoryName = (cat: string): string => {
		switch (cat.toUpperCase()) {
			case "VISITOR":
				return "Evaluación Inducción Visitas Hualpén"
			case "VISITOR_TRM":
				return "Evaluación Inducción Visitas El Avellano"
			case "IRL":
				return "Evaluación Inducción de Riesgos Laborales"
			default:
				return cat
		}
	}

	if (step === "loading") {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<Loader2Icon className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
					<p>Cargando evaluación...</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex items-center justify-center p-4">
				<Card className="w-full max-w-lg">
					<CardHeader>
						<CardTitle className="text-red-600">Error</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
						<Button variant="outline" className="w-full" onClick={() => router.back()}>
							<ChevronLeftIcon className="h-4 w-4" />
							Volver
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="w-full px-4 py-8">
			<div className="mx-auto max-w-4xl">
				<div className="mb-8 flex">
					<div className="flex-1 text-center">
						<h1 className="mb-2 text-3xl font-bold">{getCategoryName(category)}</h1>
						<p className="text-muted-foreground">Evaluación de Seguridad - Oleoducto Trasandino</p>
					</div>
				</div>

				{step === "blocked" && status && (
					<Card className="border-red-500">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-red-600">
								<AlertCircleIcon className="h-5 w-5" />
								Acceso Bloqueado
							</CardTitle>
							<CardDescription>
								{status.nextAttemptAt
									? "Tu acceso a esta evaluación está temporalmente bloqueado"
									: "Tu acceso a esta evaluación ha sido bloqueado permanentemente"}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{status.nextAttemptAt ? (
								<Alert>
									<AlertDescription>
										Podrás intentar nuevamente el{" "}
										{new Date(status.nextAttemptAt).toLocaleDateString("es-CL", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</AlertDescription>
								</Alert>
							) : (
								<Alert variant="destructive">
									<AlertDescription>
										Has agotado todos los intentos disponibles. Por favor, contacta a un
										administrador para solicitar un desbloqueo.
									</AlertDescription>
								</Alert>
							)}

							<div className="text-muted-foreground text-sm">
								<p>Intentos realizados: {status.currentAttempts} de 3</p>
							</div>

							<Button onClick={() => router.back()} variant="outline" className="w-full">
								<ChevronLeftIcon className="h-4 w-4" />
								Volver
							</Button>
						</CardContent>
					</Card>
				)}

				{step === "evaluation" && selectedQuestions.length === 0 && (
					<Card>
						<CardContent className="flex items-center justify-center py-12">
							<div className="text-center">
								<Loader2Icon className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
								<p className="text-muted-foreground">Cargando preguntas...</p>
							</div>
						</CardContent>
					</Card>
				)}

				{step === "evaluation" && selectedQuestions.length > 0 && (
					<EvaluationForm
						category={category}
						questions={selectedQuestions}
						trueFalseQuestions={selectedTrueFalseQuestions}
						onComplete={handleEvaluationComplete}
					/>
				)}

				{step === "result" && result && status && (
					<EvaluationResult
						category={category}
						score={result.score}
						passed={result.passed}
						attemptNumber={status.currentAttempts}
						nextAttemptAt={status.nextAttemptAt}
						isPermanentlyBlocked={status.currentAttempts >= 3 && !status.nextAttemptAt}
						expiresAt={status.expiresAt || undefined}
						userSafetyTalkId={status.id}
						validatedAnswers={result.validatedAnswers}
						questions={selectedQuestions}
						trueFalseQuestions={selectedTrueFalseQuestions}
						correctAnswersMap={getCorrectAnswersMap(category, selectedQuestions)}
					/>
				)}
			</div>
		</div>
	)
}
