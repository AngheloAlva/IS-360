"use client"

import { CheckCircle2, Clock } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

import { submitEvaluation } from "../actions/submit-evaluation"

import { Progress } from "@/shared/components/ui/progress"
import { TrueFalseQuestion } from "./TrueFalseQuestion"
import { Button } from "@/shared/components/ui/button"
import { QuestionCard } from "./QuestionCard"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

interface Question {
	id?: number
	pregunta: string
	opciones?: string[]
	correcta?: string
}

interface TrueFalseQuestion {
	id: number
	pregunta: string
}

interface EvaluationFormProps {
	category: string
	questions: Question[]
	trueFalseQuestions?: TrueFalseQuestion[]
	invitationToken?: string
	email?: string
	onComplete?: (result: {
		passed: boolean
		score: number
		validatedAnswers?: Array<{
			questionId: number
			answer: string
			isCorrect: boolean
			isTrueFalse?: boolean
		}>
	}) => void
	onStart?: () => void
}

export function EvaluationForm({
	category,
	questions,
	trueFalseQuestions = [],
	invitationToken,
	email,
	onComplete,
	onStart,
}: EvaluationFormProps) {
	const [answers, setAnswers] = useState<Record<number, string>>({})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [startTime] = useState(Date.now())
	const [timeLeft, setTimeLeft] = useState(1200)

	const totalQuestions = questions.length + trueFalseQuestions.length
	const answeredQuestions = Object.keys(answers).length
	const progress = (answeredQuestions / totalQuestions) * 100

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins}:${secs.toString().padStart(2, "0")}`
	}

	const handleAnswerChange = (questionId: number, answer: string) => {
		setAnswers((prev) => {
			const newAnswers = {
				...prev,
				[questionId]: answer,
			}

			return newAnswers
		})
	}

	const handleSubmit = useCallback(
		async (autoSubmit = false) => {
			if (!autoSubmit && answeredQuestions < totalQuestions) {
				toast.error("Debes responder todas las preguntas antes de enviar")
				return
			}

			setIsSubmitting(true)

			try {
				const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000)

				const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
					questionId: parseInt(questionId),
					answer,
				}))

				const result = await submitEvaluation({
					category,
					answers: formattedAnswers,
					timeSpentSeconds,
					invitationToken,
					email,
					selectedQuestions: questions,
				})

				if (result.success) {
					if (result.passed) {
						toast.success(result.message || "¡Felicitaciones! Has aprobado la evaluación")
					} else {
						toast.error(result.message || "No has aprobado la evaluación")
					}

					if (onComplete) {
						onComplete({
							passed: result.passed || false,
							score: result.score || 0,
							validatedAnswers: result.validatedAnswers,
						})
					}
				} else {
					toast.error(result.error || "Error al enviar la evaluación")
				}
			} catch (error) {
				console.error("Error submitting evaluation:", error)
				toast.error("Error al enviar la evaluación")
			} finally {
				setIsSubmitting(false)
			}
		},
		[
			answers,
			answeredQuestions,
			totalQuestions,
			startTime,
			category,
			invitationToken,
			email,
			onComplete,
			questions,
		]
	)

	useEffect(() => {
		if (onStart) {
			onStart()
		}
	}, [onStart, questions, trueFalseQuestions])

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timer)
					toast.error("Se acabó el tiempo. Enviando evaluación...")
     void handleSubmit(true)
					return 0
				}
				return prev - 1
			})
		}, 1000)

		return () => clearInterval(timer)
	}, [handleSubmit])

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Evaluación en Progreso</CardTitle>
							<CardDescription>
								Responde todas las preguntas.{" "}
								{category === "IRL"
									? "Necesitas 100% para aprobar."
									: "Necesitas 70% para aprobar."}
							</CardDescription>
						</div>
						<div
							className={`flex items-center gap-2 ${timeLeft < 300 ? "text-red-600" : "text-muted-foreground"}`}
						>
							<Clock className="h-5 w-5" />
							<span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<div className="text-muted-foreground flex justify-between text-sm">
							<span>Progreso</span>
							<span>
								{answeredQuestions} / {totalQuestions} preguntas
							</span>
						</div>
						<Progress value={progress} />
					</div>
				</CardContent>
			</Card>

			{questions.length > 0 && (
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Sección 1: Opción Múltiple</h3>
					{questions.map((question, index) => {
						const questionId = question.id || index + 1
						return (
							<QuestionCard
								key={questionId}
								questionNumber={index + 1}
								question={question.pregunta}
								options={question.opciones || []}
								selectedAnswer={answers[questionId]}
								onAnswerChange={(answer) => handleAnswerChange(questionId, answer)}
							/>
						)
					})}
				</div>
			)}

			{trueFalseQuestions.length > 0 && (
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Sección 2: Verdadero o Falso</h3>
					{trueFalseQuestions.map((question, index) => (
						<TrueFalseQuestion
							key={question.id}
							questionNumber={questions.length + index + 1}
							question={question.pregunta}
							selectedAnswer={answers[100 + question.id]}
							onAnswerChange={(answer) => handleAnswerChange(100 + question.id, answer)}
						/>
					))}
				</div>
			)}

			<div className="flex items-center justify-between">
				<div className="text-muted-foreground text-sm">
					{answeredQuestions < totalQuestions ? (
						<span className="text-orange-600">
							Faltan {totalQuestions - answeredQuestions} preguntas por responder
						</span>
					) : (
						<span className="flex items-center gap-2 text-green-600">
							<CheckCircle2 className="h-4 w-4" />
							Todas las preguntas respondidas
						</span>
					)}
				</div>
				<Button
					size="lg"
					onClick={() => handleSubmit(false)}
					disabled={isSubmitting || answeredQuestions < totalQuestions}
				>
					{isSubmitting ? "Enviando..." : "Enviar Evaluación"}
				</Button>
			</div>
		</div>
	)
}
