/* eslint-disable @next/next/no-img-element */
"use client"

import { useFieldArray, useFormContext } from "react-hook-form"
import { Check, HelpCircle, ImagePlus, Plus, Trash, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { QUESTION_TYPES } from "@/lib/consts/safety-talks"

import { TextAreaFormField } from "@/shared/components/forms/TextAreaFormField"
import { InputFormField } from "@/shared/components/forms/InputFormField"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/shared/components/ui/tooltip"

import type { QuestionSchema } from "@/project/safety-talk/schemas/safety-talk.schema"

interface QuestionCardProps {
	index: number
	onRemove: () => void
	question: QuestionSchema
	onUpdate: (question: QuestionSchema) => void
}

export default function QuestionCard({ index, question, onRemove, onUpdate }: QuestionCardProps) {
	const [imagePreview, setImagePreview] = useState<string | null>(question.imageUrl || null)
	const [questionType, setQuestionType] = useState<string>(question.type)

	const form = useFormContext<QuestionSchema>()

	const {
		fields: options,
		append: appendOption,
		remove: removeOption,
		update: updateOption,
	} = useFieldArray({
		control: form.control,
		name: "options",
	})

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		// Validar tipo de imagen
		if (!file.type.startsWith("image/")) {
			toast.error("Por favor sube solo imágenes")
			return
		}

		// Validar tamaño (max 5MB)
		const maxSize = 5 * 1024 * 1024 // 5MB
		if (file.size > maxSize) {
			toast.error("La imagen es demasiado grande", {
				description: "El tamaño máximo permitido es 5MB",
			})
			return
		}

		// Crear preview temporal
		const preview = URL.createObjectURL(file)
		setImagePreview(preview)

		try {
			// Preparar el FormData
			const formData = new FormData()
			formData.append("file", file)
			formData.append("folder", "safety-talks/questions")

			// Subir la imagen
			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			})

			if (!response.ok) {
				throw new Error("Error al subir la imagen")
			}

			const { url } = await response.json()
			form.setValue("imageUrl", url)
			toast.success("Imagen subida correctamente")
		} catch (error) {
			console.error("Error al subir la imagen:", error)
			toast.error("Error al subir la imagen", {
				description: "Por favor intenta de nuevo.",
			})
			setImagePreview(null)
		}
	}

	const addOption = () => {
		appendOption({
			text: "",
			isCorrect: false,
			order: `${options.length}`,
		})
	}

	// Actualizar pregunta cuando cambie el formulario
	const onSubmit = (data: QuestionSchema) => {
		onUpdate(data)
	}

	return (
		<div onChange={form.handleSubmit(onSubmit)}>
			<Card>
				<CardContent className="relative grid gap-4 p-6">
					<Button
						type="button"
						size="icon"
						variant="ghost"
						className="hover:bg-error/10 absolute top-2 right-2 h-8 w-8 text-red-600"
						onClick={onRemove}
					>
						<Trash className="h-4 w-4" />
					</Button>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="col-span-2 md:col-span-1">
							<TextAreaFormField<QuestionSchema>
								name="question"
								label={`Pregunta ${index + 1}`}
								control={form.control}
							/>
						</div>

						<div className="col-span-2 md:col-span-1">
							<div className="flex items-center space-x-2">
								<label className="text-sm font-medium">Tipo de pregunta</label>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<HelpCircle className="text-muted-foreground h-4 w-4" />
										</TooltipTrigger>
										<TooltipContent className="max-w-xs">
											<p>Selecciona el tipo de pregunta:</p>
											<ul className="mt-1 ml-4 list-disc text-xs">
												<li>Opción múltiple: Pregunta con varias opciones y una correcta.</li>
												<li>Zonas de imagen: Etiqueta diferentes partes de una imagen.</li>
												<li>Verdadero/Falso: Pregunta con respuesta booleana.</li>
												<li>Respuesta corta: El usuario debe escribir la respuesta.</li>
											</ul>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
							<div className="mt-2 grid grid-cols-2 gap-2">
								<Button
									type="button"
									variant={questionType === QUESTION_TYPES.MULTIPLE_CHOICE ? "default" : "outline"}
									size="sm"
									className="justify-start"
									onClick={() => {
										form.setValue("type", QUESTION_TYPES.MULTIPLE_CHOICE)
										setQuestionType(QUESTION_TYPES.MULTIPLE_CHOICE)
									}}
								>
									{questionType === QUESTION_TYPES.MULTIPLE_CHOICE && (
										<Check className="mr-2 h-4 w-4" />
									)}
									Opción múltiple
								</Button>
								<Button
									type="button"
									variant={questionType === QUESTION_TYPES.IMAGE_ZONES ? "default" : "outline"}
									size="sm"
									className="justify-start"
									onClick={() => {
										form.setValue("type", QUESTION_TYPES.IMAGE_ZONES)
										setQuestionType(QUESTION_TYPES.IMAGE_ZONES)
									}}
								>
									{questionType === QUESTION_TYPES.IMAGE_ZONES && (
										<Check className="mr-2 h-4 w-4" />
									)}
									Zonas de imagen
								</Button>
								<Button
									type="button"
									variant={questionType === QUESTION_TYPES.TRUE_FALSE ? "default" : "outline"}
									size="sm"
									className="justify-start"
									onClick={() => {
										form.setValue("type", QUESTION_TYPES.TRUE_FALSE)
										setQuestionType(QUESTION_TYPES.TRUE_FALSE)
										// Asegurar que tenga las opciones correctas para verdadero/falso
										if (options.length !== 2) {
											// Limpiar opciones existentes
											while (options.length > 0) {
												removeOption(0)
											}
											// Agregar opciones de verdadero/falso
											appendOption({ text: "Verdadero", isCorrect: false, order: "0" })
											appendOption({ text: "Falso", isCorrect: false, order: "1" })
										}
									}}
								>
									{questionType === QUESTION_TYPES.TRUE_FALSE && <Check className="mr-2 h-4 w-4" />}
									Verdadero/Falso
								</Button>
								<Button
									type="button"
									variant={questionType === QUESTION_TYPES.SHORT_ANSWER ? "default" : "outline"}
									size="sm"
									className="justify-start"
									onClick={() => {
										form.setValue("type", QUESTION_TYPES.SHORT_ANSWER)
										setQuestionType(QUESTION_TYPES.SHORT_ANSWER)
										// Asegurar que tenga al menos una opción para la respuesta correcta
										if (options.length === 0) {
											appendOption({ text: "Respuesta correcta", isCorrect: true, order: "0" })
										}
									}}
								>
									{questionType === QUESTION_TYPES.SHORT_ANSWER && (
										<Check className="mr-2 h-4 w-4" />
									)}
									Respuesta corta
								</Button>
							</div>
						</div>

						<TextAreaFormField<QuestionSchema>
							name="description"
							label="Descripción (opcional)"
							control={form.control}
						/>
					</div>

					{questionType === QUESTION_TYPES.IMAGE_ZONES && (
						<div className="col-span-full">
							<div className="flex items-center space-x-2">
								<label className="text-sm font-medium">Imagen para zonas</label>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<HelpCircle className="text-muted-foreground h-4 w-4" />
										</TooltipTrigger>
										<TooltipContent className="max-w-xs">
											<p>Sube una imagen y define zonas etiquetadas.</p>
											<p className="mt-1 text-xs">Para cada zona, agrega una opción con:</p>
											<ul className="mt-1 ml-4 list-disc text-xs">
												<li>Etiqueta de zona (A, B, C, etc.)</li>
												<li>ID de zona que identifica la parte</li>
												<li>Marca cuál es la respuesta correcta</li>
											</ul>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
							<div className="mt-2 flex flex-col gap-4 md:flex-row">
								<div className="bg-muted relative aspect-video w-full max-w-md overflow-hidden rounded-lg border">
									{imagePreview ? (
										<div className="relative h-full w-full">
											<img
												alt="Preview"
												src={imagePreview}
												className="h-full w-full object-contain"
											/>
											{/* Visualizador de zonas */}
											{options.map(
												(option, idx) =>
													option.zoneLabel && (
														<div
															key={idx}
															className="bg-primary absolute flex h-6 w-6 items-center justify-center rounded-full text-white"
															style={{
																top: `${20 + idx * 10}%`,
																left: `${20 + idx * 10}%`,
																transform: "translate(-50%, -50%)",
															}}
														>
															{option.zoneLabel}
														</div>
													)
											)}
											<Button
												type="button"
												size="icon"
												variant="ghost"
												className="hover:bg-error/10 absolute top-2 right-2 h-8 w-8 text-red-600"
												onClick={() => {
													setImagePreview(null)
													form.setValue("imageUrl", "")
												}}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									) : (
										<label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2">
											<ImagePlus className="text-muted-foreground h-8 w-8" />
											<span className="text-muted-foreground text-sm">Click para subir imagen</span>
											<span className="text-muted-foreground text-xs">
												Formatos: JPG, PNG, GIF (máx. 5MB)
											</span>
											<input
												type="file"
												className="hidden"
												accept="image/*"
												onChange={handleImageUpload}
											/>
										</label>
									)}
								</div>

								<div className="flex flex-col space-y-2">
									<p className="text-sm font-medium">Instrucciones:</p>
									<ol className="text-muted-foreground ml-4 list-decimal text-sm">
										<li>Sube una imagen clara que muestre las zonas a identificar</li>
										<li>Define cada zona con una etiqueta (A, B, C...)</li>
										<li>Añade el ID correspondiente a cada zona</li>
										<li>Marca la opción correcta</li>
									</ol>
								</div>
							</div>
						</div>
					)}

					{/* Opciones */}
					{question.type !== QUESTION_TYPES.SHORT_ANSWER && (
						<div className="col-span-full space-y-4">
							<div className="flex items-center justify-between">
								<label className="text-sm font-medium">Opciones</label>
								{question.type !== QUESTION_TYPES.TRUE_FALSE && (
									<Button type="button" variant="outline" size="sm" onClick={addOption}>
										<Plus className="mr-2 h-4 w-4" />
										Agregar opción
									</Button>
								)}
							</div>

							<div className="grid gap-4">
								{options.map((option, optionIndex) => (
									<div key={option.id} className="flex items-start gap-4">
										<div className="flex-1">
											<InputFormField<QuestionSchema>
												name={`options.${optionIndex}.text`}
												label={
													question.type === QUESTION_TYPES.IMAGE_ZONES
														? "Etiqueta de zona"
														: "Texto de opción"
												}
												control={form.control}
											/>
										</div>

										{question.type === QUESTION_TYPES.IMAGE_ZONES && (
											<div className="flex-1">
												<InputFormField<QuestionSchema>
													name={`options.${optionIndex}.zoneId`}
													label="ID de zona"
													control={form.control}
												/>
											</div>
										)}

										<div className="mt-8 flex items-center gap-4">
											<label className="flex items-center gap-2">
												<input
													type="radio"
													name={`question-${index}-correct`}
													checked={option.isCorrect}
													onChange={() => {
														// Desmarcar todas las opciones
														options.forEach((_, i) => {
															updateOption(i, { ...options[i], isCorrect: false })
														})
														// Marcar la opción seleccionada
														updateOption(optionIndex, { ...option, isCorrect: true })
													}}
													className="h-4 w-4"
												/>
												<span className="text-sm">Correcta</span>
											</label>

											{question.type !== QUESTION_TYPES.TRUE_FALSE && (
												<Button
													type="button"
													size="icon"
													variant="ghost"
													className="hover:bg-error/10 h-8 w-8 text-red-600"
													onClick={() => removeOption(optionIndex)}
												>
													<Trash className="h-4 w-4" />
												</Button>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
