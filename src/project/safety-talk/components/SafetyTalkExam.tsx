"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Clock, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { cn } from "@/lib/utils"

import { Form } from "@/shared/components/ui/form"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Progress } from "@/shared/components/ui/progress"
import { Separator } from "@/shared/components/ui/separator"
import Image from "next/image"

type QuestionType = "single" | "matching" | "image-labels"

interface Question {
	id: number
	type: QuestionType
	question: string
	description?: string
	imageUrl?: string
	options: {
		id: string
		text: string
		label?: string
	}[]
}

interface SafetyTalkExamProps {
	category: string
	title: string
	description: string
	timeLimit: number
	questions: Question[]
	minimumScore: number
}

// Server action para enviar las respuestas
const submitSafetyTalkAnswers = async (data: {
	category: string
	answers: { questionId: number; answer: string | string[] }[]
}) => {
	const response = await fetch("/api/safety-talks/submit", {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json",
		},
	})

	if (!response.ok) {
		throw new Error("Error al enviar las respuestas")
	}

	return response.json()
}

export function SafetyTalkExam({
	category,
	title,
	description,
	timeLimit,
	questions,
}: SafetyTalkExamProps) {
	const router = useRouter()
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
	const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60) // en segundos
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
	const [showTimeWarning, setShowTimeWarning] = useState(false)
	setShowTimeWarning(false)

	// Crear un esquema dinámico basado en las preguntas
	const createFormSchema = () => {
		const currentQuestion = questions[currentQuestionIndex]

		if (!currentQuestion) return z.object({})

		const questionId = currentQuestion.id

		switch (currentQuestion.type) {
			case "single":
				return z.object({
					[questionId]: z.string({
						required_error: "Debes seleccionar una opción",
					}),
				})

			case "matching":
				return z.object({
					[questionId]: z.array(z.string(), {
						required_error: "Debes relacionar todas las opciones",
					}),
				})

			case "image-labels":
				return z.object({
					[questionId]: z.array(z.string(), {
						required_error: "Debes etiquetar todas las zonas",
					}),
				})

			default:
				return z.object({})
		}
	}

	// Configurar el formulario para la pregunta actual
	const form = useForm<Record<number, string | string[]>>({
		resolver: zodResolver(createFormSchema()),
		defaultValues: {
			[questions[currentQuestionIndex]?.id]: answers[questions[currentQuestionIndex]?.id] || "",
		},
	})

	// Actualizar el formulario cuando cambie la pregunta actual
	useEffect(() => {
		if (currentQuestionIndex < questions.length) {
			const currentQuestionId = questions[currentQuestionIndex].id
			form.reset({
				[currentQuestionId]: answers[currentQuestionId] || "",
			})
		}
	}, [currentQuestionIndex, form, answers, questions])

	// Gestionar el temporizador
	useEffect(() => {
		const timer = setInterval(() => {
			setTimeRemaining((prev) => {
				if (prev <= 0) {
					clearInterval(timer)
					handleTimeExpired()
					return 0
				}
				return prev - 1
			})
		}, 1000)

		return () => clearInterval(timer)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [timeRemaining])

	// Formatear el tiempo restante
	const formatTimeRemaining = () => {
		const minutes = Math.floor(timeRemaining / 60)
		const seconds = timeRemaining % 60
		return `${minutes}:${seconds.toString().padStart(2, "0")}`
	}

	// Manejar el envío de una pregunta
	const handleQuestionSubmit = (data: Record<number, string | string[]>) => {
		// Guardar la respuesta actual
		setAnswers((prev) => ({ ...prev, ...data }))

		// Si es la última pregunta, enviar todas las respuestas
		if (currentQuestionIndex === questions.length - 1) {
			handleSubmitAllAnswers()
			return
		}

		// Avanzar a la siguiente pregunta
		setCurrentQuestionIndex((prev) => prev + 1)
	}

	// Navegar a la pregunta anterior
	const handlePreviousQuestion = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex((prev) => prev - 1)
		}
	}

	// Enviar todas las respuestas
	const handleSubmitAllAnswers = async () => {
		try {
			setIsSubmitting(true)

			// Preparar los datos para enviar
			const data = {
				category,
				answers: Object.entries(answers).map(([questionId, answer]) => ({
					questionId: parseInt(questionId),
					answer,
				})),
			}

			// Enviar las respuestas al servidor
			await submitSafetyTalkAnswers(data)

			// Redirigir al usuario a la página de detalles
			router.push(`/dashboard/charlas-de-seguridad/${category.toLowerCase()}`)
		} catch (error) {
			console.error(error)
			toast.error("Hubo un error al enviar tus respuestas. Por favor, inténtalo de nuevo.")
		} finally {
			setIsSubmitting(false)
		}
	}

	// Manejar cuando se acaba el tiempo
	const handleTimeExpired = () => {
		handleSubmitAllAnswers()
	}

	// Calcular el progreso de la evaluación
	const progress = Math.round(((currentQuestionIndex + 1) / questions.length) * 100)

	// Renderizar el contenido de la pregunta actual
	const renderCurrentQuestion = () => {
		const currentQuestion = questions[currentQuestionIndex]

		if (!currentQuestion) return null

		return (
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleQuestionSubmit)} className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">
								Pregunta {currentQuestionIndex + 1} de {questions.length}
							</CardTitle>
						</CardHeader>

						<CardContent className="space-y-4">
							<div className="space-y-2">
								<p className="text-lg font-medium">{currentQuestion.question}</p>

								{currentQuestion.description && (
									<p className="text-muted-foreground">{currentQuestion.description}</p>
								)}

								{currentQuestion.imageUrl && (
									<div className="relative aspect-video w-full overflow-hidden rounded-lg">
										<Image
											src={currentQuestion.imageUrl}
											alt={currentQuestion.question}
											fill
											className="object-cover"
										/>
									</div>
								)}
							</div>

							{/* <FormField
								control={form.control}
								name={currentQuestion.id.toString()}
								render={({ field }) => (
									<FormItem>
										<FormControl>
											{currentQuestion.type === "single" && (
												<RadioGroup
													onValueChange={field.onChange}
													defaultValue={field.value}
													className="space-y-3"
												>
													{currentQuestion.options.map((option) => (
														<div key={option.id} className="flex items-center space-x-2">
															<RadioGroupItem value={option.id} id={option.id} />
															<FormLabel htmlFor={option.id}>{option.text}</FormLabel>
														</div>
													))}
												</RadioGroup>
											)}

											{currentQuestion.type === "matching" && (
												<div className="grid grid-cols-2 gap-4">
													{currentQuestion.options.map((option) => (
														<div key={option.id} className="space-y-2">
															<FormLabel>{option.text}</FormLabel>
															<Input
																type="text"
																{...field}
																name={`${currentQuestion.id}.${option.id}`}
															/>
														</div>
													))}
												</div>
											)}

											{currentQuestion.type === "image-labels" && (
												<div className="grid grid-cols-2 gap-4">
													{currentQuestion.options.map((option) => (
														<div key={option.id} className="space-y-2">
															<FormLabel>{option.label}</FormLabel>
															<Input
																type="text"
																{...field}
																name={`${currentQuestion.id}.${option.id}`}
															/>
														</div>
													))}
												</div>
											)}
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/> */}
						</CardContent>

						<CardFooter className="flex justify-between">
							<Button
								type="button"
								variant="outline"
								onClick={handlePreviousQuestion}
								disabled={currentQuestionIndex === 0}
							>
								Anterior
							</Button>

							<Button type="submit" disabled={isSubmitting}>
								{currentQuestionIndex === questions.length - 1 ? "Finalizar" : "Siguiente"}
							</Button>
						</CardFooter>
					</Card>
				</form>
			</Form>
		)
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">{title}</h1>
				{description && <p className="text-muted-foreground mt-1">{description}</p>}
			</div>

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Progress value={progress} className="w-[200px]" />
					<span className="text-muted-foreground text-sm">{progress}% completado</span>
				</div>

				{timeRemaining !== null && (
					<div
						className={cn(
							"flex items-center gap-2 rounded-md px-3 py-1",
							timeRemaining <= 300 ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
						)}
					>
						<Clock className="h-4 w-4" />
						<span className="font-medium">{formatTimeRemaining()}</span>
					</div>
				)}
			</div>

			{showTimeWarning && (
				<div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800">
					<AlertTriangle className="h-5 w-5 text-amber-600" />
					<p className="text-sm">
						¡Atención! Te quedan menos de 2 minutos para completar la evaluación.
					</p>
				</div>
			)}

			<Separator />

			{renderCurrentQuestion()}
		</div>
	)
}
