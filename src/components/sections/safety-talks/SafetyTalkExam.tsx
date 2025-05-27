"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Clock, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface Question {
	id: string
	type: "MULTIPLE_CHOICE" | "IMAGE_ZONES" | "TRUE_FALSE" | "SHORT_ANSWER"
	question: string
	imageUrl: string | null
	description: string | null
	options: {
		id: string
		text: string
		isCorrect: boolean
		zoneLabel: string | null
		zoneId: string | null
		order: number | string
	}[]
}

interface SafetyTalkExamProps {
	safetyTalkId: string
	title: string
	description: string | null
	minimumScore: number
	timeLimit: number | null
	questions: Question[]
}

export function SafetyTalkExam({
	safetyTalkId,
	title,
	description,
	timeLimit,
	questions,
}: SafetyTalkExamProps) {
	const router = useRouter()
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
	const [timeRemaining, setTimeRemaining] = useState<number | null>(
		timeLimit ? timeLimit * 60 : null
	) // en segundos
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
	const [answers, setAnswers] = useState<Record<string, unknown>>({})
	const [showTimeWarning, setShowTimeWarning] = useState(false)

	// Crear un esquema dinámico basado en las preguntas
	const createFormSchema = () => {
		const currentQuestion = questions[currentQuestionIndex]

		if (!currentQuestion) return z.object({})

		const questionId = currentQuestion.id

		switch (currentQuestion.type) {
			case "MULTIPLE_CHOICE":
				return z.object({
					[questionId]: z.string({
						required_error: "Debes seleccionar una opción",
					}),
				})

			case "IMAGE_ZONES":
				return z.object({
					[questionId]: z.string({
						required_error: "Debes seleccionar una zona",
					}),
				})

			case "TRUE_FALSE":
				return z.object({
					[questionId]: z.string({
						required_error: "Debes seleccionar verdadero o falso",
					}),
				})

			case "SHORT_ANSWER":
				return z.object({
					[questionId]: z
						.string({
							required_error: "Debes proporcionar una respuesta",
						})
						.min(1, "La respuesta no puede estar vacía"),
				})

			default:
				return z.object({})
		}
	}

	// Configurar el formulario para la pregunta actual
	const form = useForm<Record<string, unknown>>({
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
		if (timeRemaining === null) return

		const timer = setInterval(() => {
			setTimeRemaining((prev) => {
				if (prev === null) return null
				if (prev <= 0) {
					clearInterval(timer)
					handleTimeExpired()
					return 0
				}

				// Mostrar advertencia cuando queden 2 minutos
				if (prev === 120) {
					setShowTimeWarning(true)
					setTimeout(() => setShowTimeWarning(false), 5000)
				}

				return prev - 1
			})
		}, 1000)

		return () => clearInterval(timer)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [timeRemaining])

	const handleTimeExpired = () => {
		toast.error("Se ha agotado el tiempo. Tus respuestas serán enviadas automáticamente.")
		handleSubmitAllAnswers()
	}

	// Formatear el tiempo restante
	const formatTimeRemaining = () => {
		if (timeRemaining === null) return ""

		const minutes = Math.floor(timeRemaining / 60)
		const seconds = timeRemaining % 60

		return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
	}

	// Manejar el envío de una pregunta
	const handleQuestionSubmit = (data: Record<string, unknown>) => {
		const updatedAnswers = { ...answers, ...data }
		setAnswers(updatedAnswers)

		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1)
		} else {
			handleSubmitAllAnswers()
		}
	}

	// Navegar a la pregunta anterior
	const handlePreviousQuestion = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(currentQuestionIndex - 1)
		}
	}

	// Enviar todas las respuestas
	const handleSubmitAllAnswers = async () => {
		try {
			setIsSubmitting(true)

			// Preparar los datos para enviar
			const payload = {
				safetyTalkId,
				answers: Object.entries(answers).map(([questionId, answer]) => ({
					questionId,
					answer: typeof answer === "string" ? answer : JSON.stringify(answer),
				})),
			}

			console.log(payload)

			// Redirigir a la página de resultados después del envío exitoso
			router.push(`/dashboard/charlas-de-seguridad`)
			toast.success("¡Charla completada con éxito!")
		} catch (error) {
			console.error("Error al enviar las respuestas:", error)
			toast.error("Ocurrió un error al enviar tus respuestas. Por favor, intenta nuevamente.")
		} finally {
			setIsSubmitting(false)
		}
	}

	// Calcular el progreso de la evaluación
	const progress = Math.round(((currentQuestionIndex + 1) / questions.length) * 100)

	// Renderizar la pregunta actual
	const renderCurrentQuestion = () => {
		if (!questions.length) return null

		const currentQuestion = questions[currentQuestionIndex]

		return (
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleQuestionSubmit)} className="space-y-6">
					<Card>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div>
									<CardTitle className="text-lg">
										Pregunta {currentQuestionIndex + 1} de {questions.length}
									</CardTitle>
									<CardDescription>{currentQuestion.question}</CardDescription>
								</div>
								{currentQuestion.type === "MULTIPLE_CHOICE" && (
									<div className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
										Selección única
									</div>
								)}
								{currentQuestion.type === "TRUE_FALSE" && (
									<div className="rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
										Verdadero / Falso
									</div>
								)}
								{currentQuestion.type === "SHORT_ANSWER" && (
									<div className="rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-700">
										Respuesta corta
									</div>
								)}
								{currentQuestion.type === "IMAGE_ZONES" && (
									<div className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">
										Zonas de imagen
									</div>
								)}
							</div>
						</CardHeader>

						<CardContent className="space-y-4">
							{currentQuestion.description && (
								<div className="text-muted-foreground text-sm">{currentQuestion.description}</div>
							)}

							{currentQuestion.imageUrl && (
								<div className="my-4 overflow-hidden rounded-md border">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={currentQuestion.imageUrl}
										alt={currentQuestion.question}
										className="max-h-[300px] w-full object-contain"
									/>
								</div>
							)}

							<FormField
								control={form.control}
								name={currentQuestion.id}
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<>
												{currentQuestion.type === "MULTIPLE_CHOICE" && (
													<RadioGroup
														onValueChange={field.onChange}
														defaultValue={field.value as string | undefined}
														className="space-y-3"
													>
														{currentQuestion.options.map((option) => (
															<div key={option.id} className="flex items-center space-x-2">
																<RadioGroupItem value={option.id} id={option.id} />
																<Label htmlFor={option.id} className="cursor-pointer">
																	{option.text}
																</Label>
															</div>
														))}
													</RadioGroup>
												)}

												{currentQuestion.type === "TRUE_FALSE" && (
													<RadioGroup
														onValueChange={field.onChange}
														defaultValue={field.value as string | undefined}
														className="space-y-3"
													>
														{currentQuestion.options.map((option) => (
															<div key={option.id} className="flex items-center space-x-2">
																<RadioGroupItem value={option.id} id={option.id} />
																<Label htmlFor={option.id} className="cursor-pointer">
																	{option.text}
																</Label>
															</div>
														))}
													</RadioGroup>
												)}

												{currentQuestion.type === "SHORT_ANSWER" && (
													<Input
														placeholder="Escribe tu respuesta aquí"
														{...field}
														value={field.value as string}
													/>
												)}

												{currentQuestion.type === "IMAGE_ZONES" && (
													<div className="space-y-3">
														{currentQuestion.options.map((option) => (
															<div key={option.id} className="flex items-center space-x-2">
																<RadioGroupItem {...field} value={option.id as string} />
																<Label htmlFor={option.id} className="cursor-pointer">
																	{option.zoneLabel || option.text}
																</Label>
															</div>
														))}
													</div>
												)}
											</>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
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
