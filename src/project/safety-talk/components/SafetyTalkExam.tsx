"use client"

import { ReactElement, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Clock, AlertTriangle } from "lucide-react"
import Image from "next/image"

import { startSafetyTalk } from "../actions/start-safety-talk"
import { submitSafetyTalkAnswers } from "../actions/submit-safety-talk"

import { cn } from "@/lib/utils"

import { Button } from "@/shared/components/ui/button"
import { Progress } from "@/shared/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent, CardFooter } from "@/shared/components/ui/card"
import { Separator } from "@/shared/components/ui/separator"
import { Label } from "@/shared/components/ui/label"

const QuestionType = {
	SINGLE: "single" as const,
	MATCHING: "matching" as const,
	IMAGE_LABELS: "image-labels" as const,
}

type QuestionType = (typeof QuestionType)[keyof typeof QuestionType]

interface Question {
	id: number
	type: QuestionType
	text: string
	options?: { id: string; text: string }[]
	matchingPairs?: {
		question: string
		options: { id: string; text: string }[]
		correctId: string
	}[]
	imageUrl?: string
	imageLabels?: { id: string; label: string }[]
	correctAnswer: string | string[]
}

type QuestionAnswer = string | string[]

interface QuestionAnswers {
	[questionId: number]: QuestionAnswer
}

interface FormattedAnswer {
	questionId: number
	answer: string | string[]
}

interface Attempt {
	id: string
	startedAt: Date
}

interface SafetyTalkExamProps {
	questions: Question[]
	category: "ENVIRONMENT" | "IRL"
	title: string
	description: string
	minimumScore: number
	timeLimit: number
}

const TIME_WARNING_THRESHOLD = 300 // 5 minutes

function SingleChoiceQuestion({
	question,
	value,
	onChange,
}: {
	question: Question
	value?: string
	onChange: (value: string) => void
}) {
	// Usar un useEffect para asegurar que el valor se sincronice correctamente
	useEffect(() => {
		const radioInput = document.querySelector(`input[value="${value}"]`) as HTMLInputElement
		if (radioInput) {
			radioInput.checked = true
		}
	}, [value])

	return (
		<RadioGroup value={value} onValueChange={onChange}>
			{question.options?.map((option) => (
				<div key={option.id} className="flex items-center space-x-2">
					<RadioGroupItem value={option.id} id={option.id} />
					<Label htmlFor={option.id} className="text-sm font-medium">
						{option.text}
					</Label>
				</div>
			))}
		</RadioGroup>
	)
}

function MatchingQuestion({
	question,
	value = [],
	onChange,
}: {
	question: Question
	value?: string[]
	onChange: (value: string[]) => void
}) {
	const handleSelectChange = (index: number, selectedValue: string) => {
		const newValue = [...value]
		newValue[index] = selectedValue
		onChange(newValue)
	}

	return (
		<div className="space-y-4">
			{question.matchingPairs?.map((pair, index) => (
				<div key={index} className="space-y-2">
					<Label htmlFor={`${question.id}-${index}`} className="text-sm font-medium">
						{pair.question}
					</Label>
					<select
						id={`${question.id}-${index}`}
						value={value[index] || ""}
						onChange={(e) => handleSelectChange(index, e.target.value)}
						className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="">Selecciona una opción</option>
						{pair.options.map((option) => (
							<option key={option.id} value={option.id}>
								{option.text}
							</option>
						))}
					</select>
				</div>
			))}
		</div>
	)
}

function ImageLabelsQuestion({
	question,
	value = [],
	onChange,
}: {
	question: Question
	value?: string[]
	onChange: (value: string[]) => void
}) {
	const handleInputChange = (index: number, inputValue: string) => {
		const newValue = [...value]
		newValue[index] = inputValue
		onChange(newValue)
	}

	return (
		<div className="space-y-4">
			{question.imageUrl && (
				<Image
					src={question.imageUrl}
					alt="Imagen de la pregunta"
					width={800}
					height={600}
					className="mb-4 w-full"
				/>
			)}
			<div className="grid grid-cols-2 gap-4">
				{question.imageLabels?.map((label, index) => (
					<div key={label.id} className="space-y-2">
						<label htmlFor={`${question.id}-${label.id}`}>{label.label}</label>
						<Input
							id={`${question.id}-${label.id}`}
							type="text"
							value={value[index] || ""}
							onChange={(e) => handleInputChange(index, e.target.value)}
							placeholder="Escribe el texto correspondiente"
						/>
					</div>
				))}
			</div>
		</div>
	)
}

export function SafetyTalkExam({
	questions,
	category,
	title,
	description,
	timeLimit,
}: SafetyTalkExamProps): ReactElement {
	const router = useRouter()

	// Estado principal
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
	const [answers, setAnswers] = useState<QuestionAnswers>({})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60)
	const [showTimeWarning, setShowTimeWarning] = useState(false)
	const [isStarting, setIsStarting] = useState(true)
	const [attempt, setAttempt] = useState<Attempt | null>(null)

	// Obtener la pregunta actual
	const currentQuestion = questions[currentQuestionIndex]

	// Validar respuesta actual
	const isCurrentAnswerValid = useCallback(() => {
		if (!currentQuestion) return false

		const answer = answers[currentQuestion.id]
		if (!answer) return false

		if (Array.isArray(answer)) {
			return answer.every((a) => a !== "")
		}

		return answer !== ""
	}, [currentQuestion, answers])

	// Manejar envío de todas las respuestas
	const handleSubmitAllAnswers = useCallback(async () => {
		if (isSubmitting) return

		setIsSubmitting(true)

		try {
			if (!attempt) {
				toast.error("No se pudo enviar el examen. Por favor, inténtalo de nuevo.")
				return
			}

			// Formatear respuestas para enviar
			const formattedAnswers: FormattedAnswer[] = Object.entries(answers).map(
				([questionId, answer]) => ({
					questionId: parseInt(questionId),
					answer,
				})
			)

			const result = await submitSafetyTalkAnswers(
				attempt.id,
				category,
				formattedAnswers
			)

			if (!result.ok) {
				toast.error(result.message)
				return
			}

			toast.success("Examen enviado correctamente")
			router.push(`/dashboard/charlas-de-seguridad/${category.toLowerCase()}`)
		} catch (error) {
			console.error(error)
			toast.error("No se pudo enviar el examen. Por favor, inténtalo de nuevo.")
		} finally {
			setIsSubmitting(false)
		}
	}, [answers, attempt, category, router, isSubmitting])

	// Manejar cambios en las respuestas
	const handleAnswerChange = useCallback((value: QuestionAnswer) => {
		if (!currentQuestion) return

		setAnswers((prev) => ({
			...prev,
			[currentQuestion.id]: value,
		}))

		// Si es la última pregunta y la respuesta es válida, enviar respuestas
		if (
			currentQuestionIndex === questions.length - 1 &&
			isCurrentAnswerValid() &&
			!isSubmitting
		) {
			handleSubmitAllAnswers()
		}
	}, [currentQuestion, currentQuestionIndex, questions.length, isCurrentAnswerValid, isSubmitting, handleSubmitAllAnswers])

	// Navegación entre preguntas
	const handleNextQuestion = useCallback(() => {
		if (currentQuestionIndex === questions.length - 1) {
			handleSubmitAllAnswers()
			return
		}

		// Asegurarse de que la respuesta actual se guarde antes de navegar
		if (currentQuestion && answers[currentQuestion.id]) {
			setCurrentQuestionIndex((prev) => prev + 1)
		}
	}, [currentQuestionIndex, questions.length, handleSubmitAllAnswers, currentQuestion, answers])

	const handlePreviousQuestion = useCallback(() => {
		if (currentQuestionIndex > 0) {
			// Guardar la respuesta actual antes de navegar
			if (currentQuestion && answers[currentQuestion.id]) {
				setCurrentQuestionIndex((prev) => prev - 1)
			} else if (!currentQuestion || !answers[currentQuestion.id]) {
				// Si no hay respuesta, permitir retroceder de todos modos
				setCurrentQuestionIndex((prev) => prev - 1)
			}
		}
	}, [currentQuestionIndex, currentQuestion, answers])

	// Formatear tiempo restante
	const formatTimeRemaining = useCallback(() => {
		const minutes = Math.floor(timeRemaining / 60)
		const seconds = timeRemaining % 60
		return `${minutes}:${seconds.toString().padStart(2, "0")}`
	}, [timeRemaining])

	// Iniciar el intento
	useEffect(() => {
		const initializeAttempt = async () => {
			try {
				const response = await startSafetyTalk(category)
				if (!response.ok || !response.attempt) {
					toast.error(response.message || "Error al iniciar la charla")
					router.push(`/dashboard/charlas-de-seguridad`)
					return
				}

				const { attempt: userAttempt } = response

				if (!userAttempt.startedAt) {
					toast.error("Error: No se pudo iniciar el intento")
					router.push(`/dashboard/charlas-de-seguridad`)
					return
				}

				const startedAt = new Date(userAttempt.startedAt)

				// Si el intento ya expiró, enviar respuestas vacías
				const now = new Date()
				const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000)
				const remainingSeconds = Math.max(0, timeLimit * 60 - elapsedSeconds)

				if (remainingSeconds <= 0) {
					toast.error("El tiempo para este intento ha expirado")
					router.push(`/dashboard/charlas-de-seguridad`)
					return
				}

				setAttempt({
					id: userAttempt.id,
					startedAt,
				})

				setTimeRemaining(remainingSeconds)
				setIsStarting(false)
			} catch (error) {
				console.error(error)
				toast.error("Error al iniciar la charla")
				router.push(`/dashboard/charlas-de-seguridad`)
			}
		}

		initializeAttempt()
	}, [category, router, timeLimit])

	// Efecto para el temporizador
	useEffect(() => {
		if (isStarting || !attempt) return

		// Si el tiempo ya expiró, enviar respuestas
		if (timeRemaining <= 0) {
			handleSubmitAllAnswers()
			return
		}

		const timer = setInterval(() => {
			setTimeRemaining((prev) => {
				if (prev <= 0) {
					clearInterval(timer)
					handleSubmitAllAnswers()
					return 0
				}

				// Mostrar advertencia cuando quedan 5 minutos
				if (prev === 5 * 60) {
					setShowTimeWarning(true)
					toast.warning("¡Te quedan 5 minutos para completar la evaluación!")
				}

				return prev - 1
			})
		}, 1000)

		return () => clearInterval(timer)
	}, [showTimeWarning, handleSubmitAllAnswers, timeRemaining, isStarting, attempt])

	// Renderizar el componente
	if (isStarting) {
		return (
			<Card className="mx-auto w-full">
				<CardContent className="p-6 text-center">
					<p>Iniciando charla...</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<>
			<div className="rounded-lg bg-gradient-to-r from-emerald-600 to-sky-700 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
						<p className="opacity-90">{description}</p>
					</div>
				</div>
			</div>

			<Card className="mx-auto w-full">
				<CardContent>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<p className="text-muted-foreground text-sm">
								Pregunta {currentQuestionIndex + 1} de {questions.length}
							</p>

							<div className="flex items-center justify-between">
								<div
									className={cn(
										"flex items-center gap-2 rounded-md px-3 py-1",
										timeRemaining <= TIME_WARNING_THRESHOLD
											? "bg-red-500/10 text-red-600"
											: "bg-teal-500/10 text-teal-600"
									)}
								>
									<Clock className="h-4 w-4" />
									<span className="font-bold">{formatTimeRemaining()}</span>
								</div>
							</div>
						</div>

						<Progress value={(currentQuestionIndex / questions.length) * 100} />

						<Separator />

						{/* Advertencia de tiempo */}
						{showTimeWarning && (
							<div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800">
								<AlertTriangle className="h-5 w-5 text-amber-600" />
								<p className="text-sm">
									¡Atención! Te quedan menos de 5 minutos para completar la evaluación.
								</p>
							</div>
						)}

						{/* Pregunta actual */}
						{currentQuestion && (
							<div className="space-y-4">
								<p className="text-lg font-medium">{currentQuestion.text}</p>

								{currentQuestion.type === QuestionType.SINGLE && (
									<SingleChoiceQuestion
										question={currentQuestion}
										value={answers[currentQuestion.id] as string}
										onChange={handleAnswerChange}
									/>
								)}

								{currentQuestion.type === QuestionType.MATCHING && (
									<MatchingQuestion
										question={currentQuestion}
										value={answers[currentQuestion.id] as string[]}
										onChange={handleAnswerChange}
									/>
								)}

								{currentQuestion.type === QuestionType.IMAGE_LABELS && (
									<ImageLabelsQuestion
										question={currentQuestion}
										value={answers[currentQuestion.id] as string[]}
										onChange={handleAnswerChange}
									/>
								)}
							</div>
						)}
					</div>
				</CardContent>

				<CardFooter className="flex justify-between p-6">
					<Button
						variant="outline"
						onClick={handlePreviousQuestion}
						disabled={currentQuestionIndex === 0 || isSubmitting}
					>
						Anterior
					</Button>

					<Button
						onClick={handleNextQuestion}
						disabled={!isCurrentAnswerValid() || isSubmitting}
						className="bg-teal-600 text-white hover:bg-teal-700 hover:text-white"
					>
						{currentQuestionIndex === questions.length - 1 ? "Finalizar" : "Siguiente"}
					</Button>
				</CardFooter>
			</Card>
		</>
	)
}
