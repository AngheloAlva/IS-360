"use client"

import { useFieldArray, type Control } from "react-hook-form"
import { PlusCircle } from "lucide-react"

import { QUESTION_TYPES } from "@/lib/consts/safety-talks"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import QuestionCard from "./QuestionCard"

import type {
	SafetyTalkSchema,
	QuestionSchema,
} from "@/lib/form-schemas/safety-talk/safety-talk.schema"

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
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-medium">Preguntas</h3>
							<p className="text-muted-foreground text-sm">
								Agrega las preguntas para evaluar el conocimiento
							</p>
						</div>

						<div className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => addQuestion(QUESTION_TYPES.MULTIPLE_CHOICE)}
							>
								<PlusCircle className="mr-2 h-4 w-4" />
								Opción múltiple
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => addQuestion(QUESTION_TYPES.IMAGE_ZONES)}
							>
								<PlusCircle className="mr-2 h-4 w-4" />
								Zonas de imagen
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => addQuestion(QUESTION_TYPES.TRUE_FALSE)}
							>
								<PlusCircle className="mr-2 h-4 w-4" />
								Verdadero/Falso
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => addQuestion(QUESTION_TYPES.SHORT_ANSWER)}
							>
								<PlusCircle className="mr-2 h-4 w-4" />
								Respuesta corta
							</Button>
						</div>
					</div>

					<div className="mt-4 space-y-4">
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
				</div>
			</CardContent>
		</Card>
	)
}
