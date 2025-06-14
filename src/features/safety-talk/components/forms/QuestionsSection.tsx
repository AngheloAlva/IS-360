"use client"

import { FileQuestion, ImagePlus, ListChecks, MessageSquare, PlusCircle } from "lucide-react"
import { useFieldArray, type Control } from "react-hook-form"

import { QUESTION_TYPES } from "@/lib/consts/safety-talks"

import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import QuestionCard from "./QuestionCard"

import type {
	SafetyTalkSchema,
	QuestionSchema,
} from "@/features/safety-talk/schemas/safety-talk.schema"

interface QuestionsSectionProps {
	control: Control<SafetyTalkSchema>
}

export default function QuestionsSection({ control }: QuestionsSectionProps) {
	const {
		fields: questions,
		append: appendQuestion,
		remove: removeQuestion,
		update: updateQuestion,
	} = useFieldArray({
		control,
		name: "questions",
	})

	// Estado para controlar si se muestra el panel de añadir preguntas
	const hasQuestions = questions.length > 0

	const addQuestion = (type: keyof typeof QUESTION_TYPES) => {
		const newQuestion = {
			type,
			question: "",
			options:
				type === QUESTION_TYPES.TRUE_FALSE
					? [
							{ text: "Opción Verdadera", isCorrect: true, order: "0" },
							{ text: "Opción Falsa", isCorrect: false, order: "1" },
						]
					: [],
			description: "",
		}

		appendQuestion(newQuestion)
	}

	return (
		<Card>
			<CardContent className="grid w-full gap-x-3 gap-y-5">
				<div className="col-span-full">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div>
							<h3 className="text-lg font-medium">Preguntas</h3>
							<p className="text-muted-foreground text-sm">
								{hasQuestions
									? `${questions.length} ${questions.length === 1 ? "pregunta" : "preguntas"} añadidas`
									: "Agrega preguntas para evaluar el conocimiento"}
							</p>
						</div>

						<div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-2">
							<Button
								type="button"
								variant="outline"
								className="flex-grow md:flex-grow-0"
								onClick={() => addQuestion(QUESTION_TYPES.MULTIPLE_CHOICE)}
							>
								<ListChecks className="mr-2 h-4 w-4" />
								Opción múltiple
							</Button>
							<Button
								type="button"
								variant="outline"
								className="flex-grow md:flex-grow-0"
								onClick={() => addQuestion(QUESTION_TYPES.IMAGE_ZONES)}
							>
								<ImagePlus className="mr-2 h-4 w-4" />
								Zonas de imagen
							</Button>
							<Button
								type="button"
								variant="outline"
								className="flex-grow md:flex-grow-0"
								onClick={() => addQuestion(QUESTION_TYPES.TRUE_FALSE)}
							>
								<FileQuestion className="mr-2 h-4 w-4" />
								Verdadero/Falso
							</Button>
							<Button
								type="button"
								variant="outline"
								className="flex-grow md:flex-grow-0"
								onClick={() => addQuestion(QUESTION_TYPES.SHORT_ANSWER)}
							>
								<MessageSquare className="mr-2 h-4 w-4" />
								Respuesta corta
							</Button>
						</div>
					</div>

					<div className="mt-6 space-y-6">
						{!hasQuestions ? (
							<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
								<FileQuestion className="text-muted-foreground mb-4 h-12 w-12" />
								<h3 className="text-lg font-medium">No hay preguntas todavía</h3>
								<p className="text-muted-foreground mt-2 max-w-md text-sm">
									Añade preguntas utilizando los botones de arriba. Puedes crear preguntas de opción
									múltiple, zonas de imagen, verdadero/falso o respuesta corta.
								</p>
								{/* Botones simplificados para caso vacío */}
								<div className="mt-4 flex gap-2">
									<Button
										type="button"
										variant="default"
										size="sm"
										onClick={() => addQuestion(QUESTION_TYPES.MULTIPLE_CHOICE)}
									>
										<PlusCircle className="mr-2 h-4 w-4" />
										Añadir primera pregunta
									</Button>
								</div>
							</div>
						) : (
							<div className="space-y-6">
								{questions.map((question, index) => (
									<QuestionCard
										key={question.id}
										index={index}
										question={question}
										onRemove={() => removeQuestion(index)}
										onUpdate={(updatedQuestion: QuestionSchema) =>
											updateQuestion(index, updatedQuestion)
										}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
