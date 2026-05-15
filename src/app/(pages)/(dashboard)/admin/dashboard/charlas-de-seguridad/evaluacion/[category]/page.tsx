"use client"

import { useParams, useRouter } from "next/navigation"
import { ChevronLeftIcon } from "lucide-react"
import { useState } from "react"
import {
	getQuestionsByCategory,
	getIRLTrueFalseQuestions,
	getCorrectAnswersMap,
} from "@/project/safety-talk/utils/questions-loader"

import { EvaluationResult } from "@/project/safety-talk/components/EvaluationResult"
import { EvaluationForm } from "@/project/safety-talk/components/EvaluationForm"
import { Button } from "@/shared/components/ui/button"

import type { SAFETY_TALK_CATEGORY } from "@/generated/prisma/enums"

type Step = "evaluation" | "result"

export default function AdminEvaluationPage() {
	const params = useParams()
	const router = useRouter()
	const category = params.category as SAFETY_TALK_CATEGORY

	const [step, setStep] = useState<Step>("evaluation")
	const [result, setResult] = useState<{
		passed: boolean
		score: number
		validatedAnswers?: Array<{
			questionId: number
			answer: string
			isCorrect: boolean
			isTrueFalse?: boolean
		}>
	} | null>(null)
	const [selectedQuestions] = useState(() => getQuestionsByCategory(category))
	const [selectedTrueFalseQuestions] = useState(() =>
		category.toUpperCase() === "IRL" ? getIRLTrueFalseQuestions() : []
	)

	const handleEvaluationComplete = (evaluationResult: {
		passed: boolean
		score: number
		validatedAnswers?: Array<{
			questionId: number
			answer: string
			isCorrect: boolean
			isTrueFalse?: boolean
		}>
	}) => {
		setResult(evaluationResult)
		setStep("result")
	}

	const getCategoryName = (cat: SAFETY_TALK_CATEGORY): string => {
		switch (cat) {
			case "VISITOR":
				return "Evaluación de Inducción Visitas Hualpén"
			case "VISITOR_TRM":
				return "Evaluación de Inducción Visitas El Avellano"
			case "IRL":
				return "Evaluación de Inducción de Riesgos Laborales"
			default:
				return cat
		}
	}

	return (
		<div className="w-full px-4 py-8">
			<div className="mx-auto max-w-5xl">
				<div className="mb-8 flex">
					<Button onClick={() => router.back()} variant="ghost">
						<ChevronLeftIcon className="h-4 w-4" />
						Volver
					</Button>

					<div className="flex-1 text-center">
						<h1 className="mb-2 text-3xl font-bold">{getCategoryName(category)}</h1>
						<p className="text-muted-foreground">Evaluación de Seguridad - Modo Administrador</p>
					</div>

					<div className="w-14"></div>
				</div>

				{step === "evaluation" && selectedQuestions.length > 0 && (
					<EvaluationForm
						category={category.toUpperCase()}
						questions={selectedQuestions}
						trueFalseQuestions={selectedTrueFalseQuestions}
						onComplete={handleEvaluationComplete}
					/>
				)}

				{step === "result" && result && (
					<EvaluationResult
						passed={result.passed}
						score={result.score}
						category={category}
						validatedAnswers={result.validatedAnswers}
						questions={selectedQuestions}
						trueFalseQuestions={selectedTrueFalseQuestions}
						correctAnswersMap={getCorrectAnswersMap(category, selectedQuestions)}
					/>
				)}
			</div>
		</div>
	)
}
