import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"
import { calculateScore, Question, validateAnswer } from "../utils/questions-loader"
import { SubmitSafetyTalkAttemptSchema } from "../schemas/attempt.schema"

import { uploadCertificateToStartupFolders } from "./upload-certificate-to-startup-folders"

import type { SAFETY_TALK_CATEGORY } from "@/generated/prisma/enums"

type SubmitEvaluationResult = {
	success: boolean
	error?: string
	passed?: boolean
	score?: number
	message?: string
	attemptNumber?: number
	nextAttemptAt?: Date | null
	isPermanentlyBlocked?: boolean
	blockedUntil?: Date
	isExternal?: boolean
	completionId?: string
	userSafetyTalkId?: string
	expiresAt?: Date
	validatedAnswers?: Array<{
		questionId: number
		answer: string
		isCorrect: boolean
		isTrueFalse?: boolean
	}>
}

export async function submitEvaluation(data: unknown): Promise<SubmitEvaluationResult> {
	try {
		const validated = SubmitSafetyTalkAttemptSchema.parse(data)
		const { category, answers, timeSpentSeconds, invitationToken, selectedQuestions } = validated

		if (invitationToken) {
			if (!validated.email) {
				return { success: false, error: "Email requerido para usuarios externos" }
			}
			return processExternalUserEvaluation(
				invitationToken,
				validated.email,
				category,
				answers,
				timeSpentSeconds,
				selectedQuestions,
			)
		}
		return processRegisteredUserEvaluation(category, answers, timeSpentSeconds, selectedQuestions)
	} catch (error) {
		console.error("[SUBMIT_EVALUATION]", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Error al enviar la evaluación",
		}
	}
}

function validateAndScore(
	category: SAFETY_TALK_CATEGORY,
	answers: Array<{ questionId: number; answer: string; isCorrect?: boolean }>,
	selectedQuestions?: Question[],
) {
	const validatedAnswers = answers.map((ans) => {
		const isTrueFalse = ans.questionId > 100
		const isCorrect = validateAnswer(category, ans.questionId, ans.answer, isTrueFalse, selectedQuestions)
		return { ...ans, isCorrect, isTrueFalse }
	})
	const score = calculateScore(
		category,
		validatedAnswers.map((a) => ({ questionId: a.questionId, answer: a.answer, isTrueFalse: a.isTrueFalse })),
		selectedQuestions,
	)
	return { validatedAnswers, score }
}

async function processRegisteredUserEvaluation(
	category: SAFETY_TALK_CATEGORY,
	answers: Array<{ questionId: number; answer: string; isCorrect?: boolean }>,
	timeSpentSeconds?: number,
	selectedQuestions?: Question[],
): Promise<SubmitEvaluationResult> {
	const user = getDemoUser()
	if (!user) {
		return { success: false, error: "No autenticado" }
	}

	const db = await getDemoDb()
	const { validatedAnswers, score } = validateAndScore(category, answers, selectedQuestions)
	const requiredScore = category === "IRL" ? 100 : 70
	const passed = score >= requiredScore
	const now = new Date()
	const nowIso = now.toISOString()

	const existingRes = await db.query<{ id: string; currentAttempts: number }>(
		`SELECT id, "currentAttempts" FROM "user_safety_talk"
		 WHERE "userId" = $1 AND category = $2 LIMIT 1`,
		[user.id, category],
	)
	let userSafetyTalkId = existingRes.rows[0]?.id
	let currentAttempts = existingRes.rows[0]?.currentAttempts ?? 0

	if (!userSafetyTalkId) {
		userSafetyTalkId = crypto.randomUUID()
		await db.query(
			`INSERT INTO "user_safety_talk" (
				"id", "userId", category, status, "currentAttempts", "startedAt",
				"createdAt", "updatedAt"
			) VALUES ($1, $2, $3, 'IN_PROGRESS', 0, $4, $4, $4)`,
			[userSafetyTalkId, user.id, category, nowIso],
		)
		currentAttempts = 0
	}

	const attemptNumber = currentAttempts + 1
	const attemptId = crypto.randomUUID()
	await db.query(
		`INSERT INTO "safety_talk_attempt" (
			"id", "userId", "userSafetyTalkId", category, score, passed,
			answers, "attemptNumber", "completedAt", "timeSpentSeconds",
			"createdAt", "updatedAt"
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $9, $9)`,
		[
			attemptId,
			user.id,
			userSafetyTalkId,
			category,
			score,
			passed,
			JSON.stringify(validatedAnswers),
			attemptNumber,
			nowIso,
			timeSpentSeconds ?? null,
		],
	)

	await logActivity({
		userId: user.id,
		module: MODULES.SAFETY_TALK,
		action: ACTIVITY_TYPE.SUBMIT,
		entityId: attemptId,
		entityType: "SafetyTalkAttempt",
		metadata: {
			category,
			score,
			passed,
			attemptNumber,
			userSafetyTalkId,
			timeSpentSeconds,
		},
	})

	if (passed) {
		const expiresAt = new Date()
		expiresAt.setFullYear(expiresAt.getFullYear() + 1)
		await db.query(
			`UPDATE "user_safety_talk"
			 SET status = 'PASSED', "currentAttempts" = $1, "lastAttemptAt" = $2,
			     score = $3, "completedAt" = $2, "expiresAt" = $4, "nextAttemptAt" = NULL,
			     "updatedAt" = $2
			 WHERE id = $5`,
			[attemptNumber, nowIso, score, expiresAt.toISOString(), userSafetyTalkId],
		)

		if (category === "IRL") {
			try {
				await uploadCertificateToStartupFolders(userSafetyTalkId, user.id)
			} catch (error) {
				console.error("[SUBMIT_EVALUATION] cert upload noop failed", error)
			}
		}

		return {
			success: true,
			passed: true,
			score,
			attemptNumber,
			expiresAt,
			validatedAnswers,
			userSafetyTalkId,
			message: "¡Felicitaciones! Has aprobado la evaluación",
		}
	}

	await db.query(
		`UPDATE "user_safety_talk"
		 SET status = 'FAILED', "currentAttempts" = $1, "lastAttemptAt" = $2,
		     "nextAttemptAt" = NULL, score = $3, "updatedAt" = $2
		 WHERE id = $4`,
		[attemptNumber, nowIso, score, userSafetyTalkId],
	)

	const requiredScoreText = category === "IRL" ? "100%" : "70%"
	return {
		success: true,
		passed: false,
		score,
		attemptNumber,
		nextAttemptAt: null,
		isPermanentlyBlocked: false,
		validatedAnswers,
		userSafetyTalkId,
		message: `No has aprobado. Necesitas ${requiredScoreText} para aprobar. Puedes intentar nuevamente.`,
	}
}

async function processExternalUserEvaluation(
	token: string,
	email: string,
	category: SAFETY_TALK_CATEGORY,
	answers: Array<{ questionId: number; answer: string; isCorrect?: boolean }>,
	timeSpentSeconds?: number,
	selectedQuestions?: Question[],
): Promise<SubmitEvaluationResult> {
	const db = await getDemoDb()
	const talkRes = await db.query<{
		id: string
		expiresAt: string | null
		companyId: string
	}>(
		`SELECT id, "expiresAt", "companyId"
		 FROM "visitor_talk" WHERE "uniqueToken" = $1 LIMIT 1`,
		[token],
	)
	const visitorTalk = talkRes.rows[0]
	if (!visitorTalk) {
		return { success: false, error: "Invitación no encontrada" }
	}
	if (visitorTalk.expiresAt && new Date(visitorTalk.expiresAt) < new Date()) {
		return { success: false, error: "La invitación ha expirado" }
	}

	const visitorRes = await db.query<{ id: string }>(
		`SELECT id FROM "external_visitor"
		 WHERE email = $1 AND "companyId" = $2 LIMIT 1`,
		[email, visitorTalk.companyId],
	)
	const visitorId = visitorRes.rows[0]?.id
	if (!visitorId) {
		return {
			success: false,
			error: "Usuario no encontrado. Por favor completa tus datos primero.",
		}
	}

	const completionRes = await db.query<{
		id: string
		status: string
		passed: boolean | null
		attemptNumber: number
	}>(
		`SELECT id, status, passed, "attemptNumber"
		 FROM "visitor_talk_completion"
		 WHERE "visitorId" = $1 AND "visitorTalkId" = $2 LIMIT 1`,
		[visitorId, visitorTalk.id],
	)
	const existing = completionRes.rows[0]
	if (existing?.status === "COMPLETED" && existing.passed) {
		return { success: false, error: "Ya has completado esta evaluación exitosamente" }
	}

	const { validatedAnswers, score } = validateAndScore(category, answers, selectedQuestions)
	const requiredScore = category === "IRL" ? 100 : 70
	const passed = score >= requiredScore
	const now = new Date().toISOString()

	let completionId: string
	if (existing) {
		completionId = existing.id
		await db.query(
			`UPDATE "visitor_talk_completion"
			 SET status = 'COMPLETED', "completedAt" = $1, score = $2, passed = $3,
			     answers = $4, "timeSpentSeconds" = $5, "attemptNumber" = $6, "updatedAt" = $1
			 WHERE id = $7`,
			[
				now,
				score,
				passed,
				JSON.stringify(validatedAnswers),
				timeSpentSeconds ?? null,
				existing.attemptNumber + 1,
				existing.id,
			],
		)
	} else {
		completionId = crypto.randomUUID()
		await db.query(
			`INSERT INTO "visitor_talk_completion" (
				"id", "visitorId", "visitorTalkId", status, "completedAt", score, passed,
				answers, "timeSpentSeconds", "attemptNumber", "createdAt", "updatedAt"
			) VALUES ($1, $2, $3, 'COMPLETED', $4, $5, $6, $7, $8, 1, $4, $4)`,
			[
				completionId,
				visitorId,
				visitorTalk.id,
				now,
				score,
				passed,
				JSON.stringify(validatedAnswers),
				timeSpentSeconds ?? null,
			],
		)
	}

	return {
		success: true,
		passed,
		score,
		isExternal: true,
		completionId,
		validatedAnswers,
		message: passed
			? "¡Felicitaciones! Has aprobado la evaluación. Descarga tu certificado."
			: "No has aprobado la evaluación. Contacta al administrador para más información.",
	}
}
