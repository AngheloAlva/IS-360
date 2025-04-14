/* eslint-disable @next/next/no-img-element */
"use client"

import { useFieldArray, useFormContext } from "react-hook-form"
import { ImagePlus, Plus, Trash, X } from "lucide-react"
import { useState } from "react"

import { QUESTION_TYPES } from "@/lib/consts/safety-talks"

import { TextAreaFormField } from "@/components/forms/shared/TextAreaFormField"
import { InputFormField } from "@/components/forms/shared/InputFormField"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import type { QuestionSchema } from "@/lib/form-schemas/safety-talk/safety-talk.schema"

interface QuestionCardProps {
	index: number
	question: QuestionSchema
	onRemove: () => void
	onUpdate: (question: QuestionSchema) => void
}

export default function QuestionCard({ index, question, onRemove, onUpdate }: QuestionCardProps) {
	const [imagePreview, setImagePreview] = useState<string | null>(question.imageUrl || null)

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
			alert("Por favor sube solo imágenes")
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
		} catch (error) {
			console.error("Error al subir la imagen:", error)
			alert("Error al subir la imagen. Por favor intenta de nuevo.")
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
						<TextAreaFormField<QuestionSchema>
							name="question"
							label={`Pregunta ${index + 1}`}
							control={form.control}
						/>

						<TextAreaFormField<QuestionSchema>
							name="description"
							label="Descripción (opcional)"
							control={form.control}
						/>
					</div>

					{question.type === QUESTION_TYPES.IMAGE_ZONES && (
						<div className="col-span-full">
							<label className="mb-2 block text-sm font-medium">Imagen para zonas</label>
							<div className="flex gap-4">
								<div className="bg-muted relative aspect-video w-full max-w-md overflow-hidden rounded-lg border">
									{imagePreview ? (
										<>
											<img
												alt="Preview"
												src={imagePreview}
												className="h-full w-full object-contain"
											/>
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
										</>
									) : (
										<label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2">
											<ImagePlus className="text-muted-foreground h-8 w-8" />
											<span className="text-muted-foreground text-sm">Click para subir imagen</span>
											<input
												type="file"
												className="hidden"
												accept="image/*"
												onChange={handleImageUpload}
											/>
										</label>
									)}
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
