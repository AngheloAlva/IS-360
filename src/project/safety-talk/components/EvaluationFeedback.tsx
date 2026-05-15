"use client"

import { CheckCircle2, XCircle } from "lucide-react"

import type { Question, TrueFalseQuestion } from "../utils/questions-loader"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

interface Answer {
	questionId: number
	answer: string
	isCorrect: boolean
	isTrueFalse?: boolean
}

interface EvaluationFeedbackProps {
	answers: Answer[]
	questions: Question[]
	trueFalseQuestions?: TrueFalseQuestion[]
	correctAnswersMap: Record<number, string>
}

export function EvaluationFeedback({
	answers,
	questions,
	trueFalseQuestions = [],
	correctAnswersMap,
}: EvaluationFeedbackProps) {
	const multipleChoiceAnswers = answers.filter((a) => !a.isTrueFalse)
	const trueFalseAnswers = answers.filter((a) => a.isTrueFalse)

	return (
		<div className="space-y-6">
			{multipleChoiceAnswers.length > 0 && (
				<div className="space-y-4">
					{multipleChoiceAnswers.map((answer, index) => {
						const question = questions.find((q) => q.id === answer.questionId)
						if (!question) {
							console.warn(`Question not found for questionId: ${answer.questionId}`, {
								answer,
								availableQuestions: questions.map((q) => ({ id: q.id, pregunta: q.pregunta })),
							})
							return null
						}

						const correctAnswer = correctAnswersMap[answer.questionId]

						return (
							<Card
								key={answer.questionId}
								className={
									answer.isCorrect
										? "border-green-500 bg-green-500/5"
										: "border-red-500 bg-red-500/5"
								}
							>
								<CardHeader>
									<CardTitle className="flex items-start gap-2 text-lg">
										{answer.isCorrect ? (
											<CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
										) : (
											<XCircle className="mt-1 h-5 w-5 flex-shrink-0 text-red-500" />
										)}
										<span className="whitespace-pre-line">
											{index + 1}. {question.pregunta}
										</span>
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div>
										<p className="text-muted-foreground text-sm font-semibold">Tu respuesta:</p>
										<p
											className={`mt-1 rounded-lg border p-3 ${
												answer.isCorrect
													? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300"
													: "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300"
											}`}
										>
											{answer.answer}
										</p>
									</div>

									{!answer.isCorrect && correctAnswer && (
										<div>
											<p className="text-muted-foreground text-sm font-semibold">
												Respuesta correcta:
											</p>
											<p className="mt-1 rounded-lg border border-green-500 bg-green-500/20 p-3 text-green-700 dark:text-green-300">
												{correctAnswer}
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						)
					})}
				</div>
			)}

			{trueFalseAnswers.length > 0 && trueFalseQuestions.length > 0 && (
				<div className="space-y-4">
					{trueFalseAnswers.map((answer, index) => {
						const question = trueFalseQuestions.find((q) => 100 + q.id === answer.questionId)
						if (!question) return null

						const correctAnswer = correctAnswersMap[answer.questionId]
						const correctAnswerText = correctAnswer === "true" ? "Verdadero" : "Falso"
						const userAnswerText = answer.answer === "true" ? "Verdadero" : "Falso"

						return (
							<Card
								key={answer.questionId}
								className={
									answer.isCorrect
										? "border-green-500 bg-green-500/10"
										: "border-red-500 bg-red-500/10"
								}
							>
								<CardHeader>
									<CardTitle className="flex items-start gap-2 text-lg">
										{answer.isCorrect ? (
											<CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
										) : (
											<XCircle className="mt-1 h-5 w-5 flex-shrink-0 text-red-600" />
										)}
										<span className="whitespace-pre-line">
											{multipleChoiceAnswers.length + index + 1}. {question.pregunta}
										</span>
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div>
										<p className="text-muted-foreground text-sm font-semibold">Tu respuesta:</p>
										<p
											className={`mt-1 rounded-lg border p-3 ${
												answer.isCorrect
													? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300"
													: "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300"
											}`}
										>
											{userAnswerText}
										</p>
									</div>

									{!answer.isCorrect && (
										<div>
											<p className="text-muted-foreground text-sm font-semibold">
												Respuesta correcta:
											</p>
											<p className="mt-1 rounded-lg border border-green-500 bg-green-500/20 p-3 text-green-700 dark:text-green-300">
												{correctAnswerText}
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						)
					})}
				</div>
			)}
		</div>
	)
}
