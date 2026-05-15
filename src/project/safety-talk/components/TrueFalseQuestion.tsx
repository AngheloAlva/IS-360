"use client"

import { cn } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group"
import { Label } from "@/shared/components/ui/label"

interface TrueFalseQuestionProps {
	questionNumber: number
	question: string
	selectedAnswer?: string
	onAnswerChange: (answer: string) => void
	showResult?: boolean
	correctAnswer?: boolean
	isCorrect?: boolean
}

export function TrueFalseQuestion({
	questionNumber,
	question,
	selectedAnswer,
	onAnswerChange,
	showResult = false,
	correctAnswer,
	isCorrect,
}: TrueFalseQuestionProps) {
	const options = [
		{ value: "true", label: "Verdadero" },
		{ value: "false", label: "Falso" },
	]

	return (
		<Card
			className={cn(
				"transition-all",
				showResult && isCorrect && "border-green-500 bg-green-50",
				showResult && !isCorrect && "border-red-500 bg-red-50"
			)}
		>
			<CardHeader>
				<CardTitle className="text-lg">
					{questionNumber}. {question}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<RadioGroup
					value={selectedAnswer}
					onValueChange={onAnswerChange}
					disabled={showResult}
					className="flex gap-2"
				>
					{options.map((option) => {
						const isThisCorrect = showResult && String(correctAnswer) === option.value
						const isThisSelected = option.value === selectedAnswer
						const isThisWrong = showResult && isThisSelected && !isCorrect

						return (
							<div
								key={option.value}
								className={cn(
									"flex flex-1 items-center space-x-2 rounded-lg border-2 p-4 transition-all",
									isThisSelected && !showResult && "border-blue-500 bg-blue-500/20",
									!isThisSelected && !showResult && "border-muted-foreground",
									isThisCorrect && "border-green-500 bg-green-500/20",
									isThisWrong && "border-red-500 bg-red-500/20"
								)}
							>
								<RadioGroupItem value={option.value} id={`q${questionNumber}-${option.value}`} />
								<Label
									htmlFor={`q${questionNumber}-${option.value}`}
									className="flex-1 cursor-pointer font-semibold"
								>
									{option.label}
								</Label>
							</div>
						)
					})}
				</RadioGroup>
			</CardContent>
		</Card>
	)
}
