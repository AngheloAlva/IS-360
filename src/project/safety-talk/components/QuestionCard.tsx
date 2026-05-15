"use client"

import { cn } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group"
import { Label } from "@/shared/components/ui/label"

interface QuestionCardProps {
	question: string
	options: string[]
	isCorrect?: boolean
	showResult?: boolean
	correctAnswer?: string
	questionNumber: number
	selectedAnswer?: string
	onAnswerChange: (answer: string) => void
}

export function QuestionCard({
	options,
	question,
	isCorrect,
	correctAnswer,
	questionNumber,
	selectedAnswer,
	onAnswerChange,
	showResult = false,
}: QuestionCardProps) {
	return (
		<Card
			className={cn(
				"transition-all",
				showResult && isCorrect && "border-green-500 bg-green-500/20",
				showResult && !isCorrect && "border-red-500 bg-red-500/20"
			)}
		>
			<CardHeader>
				<CardTitle className="text-lg whitespace-pre-line">
					{questionNumber}. {question}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<RadioGroup
					className="gap-y-1"
					value={selectedAnswer}
					onValueChange={onAnswerChange}
					disabled={showResult}
				>
					{options.map((option, index) => {
						const isThisCorrect = showResult && option === correctAnswer
						const isThisSelected = option === selectedAnswer
						const isThisWrong = showResult && isThisSelected && !isCorrect

						return (
							<div
								key={index}
								className={cn(
									"flex items-center space-x-2 rounded-lg p-3 transition-all",
									isThisSelected && !showResult && "border border-blue-500 bg-blue-500/20",
									isThisCorrect && "border border-green-500 bg-green-500/20",
									isThisWrong && "border border-red-500 bg-red-500/20"
								)}
							>
								<RadioGroupItem value={option} id={`q${questionNumber}-${index}`} />
								<Label htmlFor={`q${questionNumber}-${index}`} className="flex-1 cursor-pointer">
									{option}
								</Label>
							</div>
						)
					})}
				</RadioGroup>
			</CardContent>
		</Card>
	)
}
