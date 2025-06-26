"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { SingleChoiceQuestion } from "./questions/SingleChoiceQuestion"
import { MatchingQuestion } from "./questions/MatchingQuestion"
import { Question, QuestionType } from "../utils/environmental-questions"
import { SafetyTalkAnswer } from "../schemas/attempt.schema"

interface SafetyTalkAttemptProps {
  category: "ENVIRONMENT" | "IRL"
  questions: Question[]
  onComplete?: () => void
}

export function SafetyTalkAttempt({
  category,
  questions,
  onComplete
}: SafetyTalkAttemptProps) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }))
  }

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      toast.error("Por favor responde la pregunta antes de continuar")
      return
    }
    setCurrentQuestionIndex(prev => prev + 1)
  }

  const handleSubmit = async () => {
    if (!answers[currentQuestion.id]) {
      toast.error("Por favor responde la pregunta antes de enviar")
      return
    }

    try {
      setIsSubmitting(true)
      const formattedAnswers: SafetyTalkAnswer[] = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer
      }))

      const response = await fetch("/api/safety-talks/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          answers: formattedAnswers
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar el intento")
      }

      toast.success("Intento enviado correctamente")
      onComplete?.()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al enviar el intento")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderQuestion = (question: Question) => {
    switch (question.type as QuestionType) {
      case "single":
        return (
          <SingleChoiceQuestion
            question={question}
            value={answers[question.id]}
            onChange={handleAnswer}
            disabled={isSubmitting}
          />
        )
      case "matching":
        return (
          <MatchingQuestion
            question={question}
            value={answers[question.id]}
            onChange={handleAnswer}
            disabled={isSubmitting}
          />
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          Charla de {category === "ENVIRONMENT" ? "Medio Ambiente" : "Riesgos Laborales"}
        </CardTitle>
        <CardDescription>
          Pregunta {currentQuestionIndex + 1} de {questions.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderQuestion(currentQuestion)}

        <div className="flex justify-end gap-4 pt-4">
          {!isLastQuestion ? (
            <Button onClick={handleNext} disabled={!answers[currentQuestion.id] || isSubmitting}>
              Siguiente
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={!answers[currentQuestion.id] || isSubmitting}
            >
              Enviar respuestas
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
