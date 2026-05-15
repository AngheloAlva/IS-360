"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import { getInvitationByToken } from "@/project/safety-talk/actions/create-invitation"
import {
	getQuestionsByCategory,
	getIRLTrueFalseQuestions,
	getCorrectAnswersMap,
} from "@/project/safety-talk/utils/questions-loader"

import { ExternalUserDataForm } from "@/project/safety-talk/components/ExternalUserDataForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { EvaluationResult } from "@/project/safety-talk/components/EvaluationResult"
import { EvaluationForm } from "@/project/safety-talk/components/EvaluationForm"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"

import type { SAFETY_TALK_CATEGORY } from "@/generated/prisma/enums"

type Step = "loading" | "data-form" | "evaluation" | "result"

type InvitationData = {
	id: string
	email: string
	category: SAFETY_TALK_CATEGORY
	status: string
	name?: string
	rut?: string
	companyName: string
	expiresAt: Date | null
	passed?: boolean | null
	score?: number | null
}

export default function ExternalEvaluationPage() {
	const params = useParams()
	const searchParams = useSearchParams()
	const token = params.token as string
	const email = searchParams.get("email")

	const [step, setStep] = useState<Step>("loading")
	const [invitation, setInvitation] = useState<InvitationData | null>(null)
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

	const loadInvitation = useCallback(async () => {
		if (!email) {
			setError("Email no proporcionado en el enlace")
			return
		}
		try {
			const response = await getInvitationByToken(token, email)

			if (!response.success || !response.invitation) {
				setError(response.error || "Error al cargar la invitación")
				return
			}

			const invitationData: InvitationData = {
				id: response.invitation.id,
				email: response.invitation.email,
				category: response.invitation.category,
				status: response.invitation.status,
				name: response.invitation.name,
				rut: response.invitation.rut,
				companyName: response.invitation.companyName,
				expiresAt: response.invitation.expiresAt,
				passed: response.invitation.passed,
				score: response.invitation.score,
			}

			setInvitation(invitationData)

			// Cargar preguntas
			const questions = getQuestionsByCategory(invitationData.category)
			const trueFalseQuestions = invitationData.category === "IRL" ? getIRLTrueFalseQuestions() : []
			setSelectedQuestions(questions)
			setSelectedTrueFalseQuestions(trueFalseQuestions)

			if (invitationData.passed) {
				setResult({ passed: true, score: invitationData.score || 100 })
				setStep("result")
			} else if (invitationData.status === "BLOCKED") {
				setError("Esta invitación ha sido bloqueada")
			} else if (!invitationData.name || !invitationData.rut || !invitationData.companyName) {
				setStep("data-form")
			} else {
				setStep("evaluation")
			}
		} catch (error) {
			console.error("Error loading invitation:", error)
			setError("Error al cargar la invitación")
		}
	}, [token, email])

	useEffect(() => {
		if (!token) {
			setError("Token no válido")
			setStep("loading")
			return
		}

		if (!email) {
			setError("Email no proporcionado en el enlace")
			setStep("loading")
			return
		}

  void loadInvitation()
	}, [token, email, loadInvitation])

	const handleDataComplete = () => {
		setStep("evaluation")
	}

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

	const getCategoryName = (category: SAFETY_TALK_CATEGORY): string => {
		switch (category) {
			case "VISITOR":
				return "Evaluación Inducción Visitas Hualpén"
			case "VISITOR_TRM":
				return "Evaluación Inducción Visitas El Avellano"
			case "IRL":
				return "Evaluación Inducción de Riesgos Laborales"
			default:
				return category
		}
	}

	if (step === "loading") {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
					<p>Cargando evaluación...</p>
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
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					</CardContent>
				</Card>
			</div>
		)
	}

	if (!invitation) {
		return null
	}

	return (
		<div className="bg-secondary-background min-h-screen px-4 py-8">
			<div className="mx-auto max-w-4xl">
				<div className="mb-8 text-center">
					<h1 className="mb-2 text-3xl font-bold">{getCategoryName(invitation.category)}</h1>
					<p className="text-muted-foreground">Evaluación de Seguridad - Industrias Demo</p>
				</div>

				{step === "data-form" && (
					<ExternalUserDataForm
						token={token}
						email={invitation.email}
						onComplete={handleDataComplete}
						initialData={{
							name: invitation.name,
							rut: invitation.rut,
							companyName: invitation.companyName,
						}}
					/>
				)}

				{step === "evaluation" && selectedQuestions.length === 0 && (
					<Card>
						<CardContent className="flex items-center justify-center py-12">
							<div className="text-center">
								<Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
								<p className="text-muted-foreground">Cargando preguntas...</p>
							</div>
						</CardContent>
					</Card>
				)}

				{step === "evaluation" && email && selectedQuestions.length > 0 && (
					<EvaluationForm
						category={invitation.category}
						questions={selectedQuestions}
						trueFalseQuestions={selectedTrueFalseQuestions}
						invitationToken={token}
						email={email}
						onComplete={handleEvaluationComplete}
					/>
				)}

				{step === "result" && result && email && (
					<EvaluationResult
						passed={result.passed}
						score={result.score}
						invitationToken={token}
						category={invitation.category}
						email={email}
						expiresAt={
							invitation?.expiresAt
								? new Date(new Date(invitation.expiresAt).getTime() + 365 * 24 * 60 * 60 * 1000)
								: undefined
						}
						validatedAnswers={result.validatedAnswers}
						questions={selectedQuestions}
						trueFalseQuestions={selectedTrueFalseQuestions}
						correctAnswersMap={getCorrectAnswersMap(invitation.category, selectedQuestions)}
					/>
				)}
			</div>
		</div>
	)
}
