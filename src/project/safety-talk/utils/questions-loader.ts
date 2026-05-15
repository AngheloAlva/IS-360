import irlTrueFalseQuestions from "@/project/safety-talk/data/irl-true-false-questions.json"
import visitPrsQuestions from "@/project/safety-talk/data/visit-prs-questions.json"
import visitTrmQuestions from "@/project/safety-talk/data/visit-trm-questions.json"
import irlQuestions from "@/project/safety-talk/data/irl-questions.json"
import {
	safetyTalkQuestionBankSchema,
	safetyTalkTrueFalseQuestionBankSchema,
} from "@/project/safety-talk/schemas/question-bank.schema"

import type { SAFETY_TALK_CATEGORY } from "@/generated/prisma/enums"

export interface Question {
	id?: number
	pregunta: string
	opciones?: string[]
	correcta?: string
}

export interface TrueFalseQuestion {
	id: number
	pregunta: string
}

const visitorPrsQuestionBank = safetyTalkQuestionBankSchema.parse(visitPrsQuestions)
const visitorTrmQuestionBank = safetyTalkQuestionBankSchema.parse(visitTrmQuestions)
const irlQuestionBank = safetyTalkQuestionBankSchema.parse(irlQuestions)
const irlTrueFalseQuestionBank = safetyTalkTrueFalseQuestionBankSchema.parse(irlTrueFalseQuestions)

const CORRECT_ANSWERS_IRL_MULTIPLE: Record<number, string> = Object.fromEntries(
	irlQuestionBank.map((question) => [question.id, question.correcta])
)

const CORRECT_ANSWERS_TRUE_FALSE: Record<number, string> = Object.fromEntries(
	irlTrueFalseQuestionBank.map((question) => [100 + question.id, question.correcta])
)

function getRandomQuestions(questions: Question[], count: number): Question[] {
	const shuffled = [...questions].sort(() => Math.random() - 0.5)
	return shuffled.slice(0, count)
}

export function getQuestionsByCategory(category: SAFETY_TALK_CATEGORY): Question[] {
	switch (category) {
		case "VISITOR_TRM":
			return getRandomQuestions(visitorTrmQuestionBank as Question[], 7)
		case "VISITOR":
			return getRandomQuestions(visitorPrsQuestionBank as Question[], 7)
		case "IRL":
			return irlQuestionBank as Question[]
		default:
			return []
	}
}

export function getIRLTrueFalseQuestions(): TrueFalseQuestion[] {
	return irlTrueFalseQuestionBank.map((question) => ({
		id: question.id,
		pregunta: question.pregunta,
	}))
}

export function validateAnswer(
	category: SAFETY_TALK_CATEGORY,
	questionId: number,
	answer: string,
	isTrueFalse: boolean = false,
	allQuestions?: Question[]
): boolean {
	if (category === "IRL" && isTrueFalse) {
		const correctAnswer = CORRECT_ANSWERS_TRUE_FALSE[questionId]
		return answer.toLowerCase() === String(correctAnswer).toLowerCase()
	}

	if (category === "IRL" && !isTrueFalse) {
		const correctAnswer = CORRECT_ANSWERS_IRL_MULTIPLE[questionId]
		return answer === correctAnswer
	}

	const questions = allQuestions || getQuestionsByCategory(category)

	// Buscar primero por ID si existe
	let question = questions.find((q) => q.id === questionId)

	// Si no se encuentra por ID, buscar por índice (fallback para compatibilidad)
	if (!question) {
		question = questions.find((q) => questions.indexOf(q) === questionId - 1)
	}

	if (!question) {
		console.error(`Question not found: questionId=${questionId}, category=${category}`)
		return false
	}

	return answer === question.correcta
}

export function calculateScore(
	category: SAFETY_TALK_CATEGORY,
	answers: Array<{ questionId: number; answer: string; isTrueFalse?: boolean }>,
	allQuestions?: Question[]
): number {
	let correctCount = 0
	const totalQuestions = answers.length

	answers.forEach((ans) => {
		if (validateAnswer(category, ans.questionId, ans.answer, ans.isTrueFalse, allQuestions)) {
			correctCount++
		}
	})

	return totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0
}

export function getCorrectAnswersMap(
	category: SAFETY_TALK_CATEGORY,
	questions: Question[]
): Record<number, string> {
	const correctAnswersMap: Record<number, string> = {}

	// Para IRL, usar los mapas predefinidos
	if (category === "IRL") {
		// Respuestas de opción múltiple
		Object.assign(correctAnswersMap, CORRECT_ANSWERS_IRL_MULTIPLE)
		// Respuestas verdadero/falso
		Object.assign(correctAnswersMap, CORRECT_ANSWERS_TRUE_FALSE)
	} else {
		// Para charlas de visita, obtener respuestas de las preguntas
		questions.forEach((q) => {
			if (q.id && q.correcta) {
				correctAnswersMap[q.id] = q.correcta
			}
		})
	}

	return correctAnswersMap
}
