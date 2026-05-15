"use server"

import { uploadCertificateToStartupFolders } from "./upload-certificate-to-startup-folders"
import { calculateScore, Question, validateAnswer } from "../utils/questions-loader"
import { SubmitSafetyTalkAttemptSchema } from "../schemas/attempt.schema"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

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
	validatedAnswers?: Array<{
		questionId: number
		answer: string
		isCorrect: boolean
		isTrueFalse?: boolean
	}>
}

export async function submitEvaluation(data: unknown): Promise<SubmitEvaluationResult> {
	try {
		const validatedData = SubmitSafetyTalkAttemptSchema.parse(data)
		const { category, answers, timeSpentSeconds, invitationToken, selectedQuestions } =
			validatedData

		if (invitationToken) {
			const email = validatedData.email
			if (!email) {
				return {
					success: false,
					error: "Email requerido para usuarios externos",
				}
			}
			return await processExternalUserEvaluation(
				invitationToken,
				email,
				category,
				answers,
				timeSpentSeconds,
				selectedQuestions
			)
		} else {
			return await processRegisteredUserEvaluation(
				category,
				answers,
				timeSpentSeconds,
				selectedQuestions
			)
		}
	} catch (error) {
		console.error("Error submitting evaluation:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Error al enviar la evaluación",
		}
	}
}

async function processRegisteredUserEvaluation(
	category: SAFETY_TALK_CATEGORY,
	answers: Array<{ questionId: number; answer: string; isCorrect?: boolean }>,
	timeSpentSeconds?: number,
	selectedQuestions?: Question[]
) {
	const session = await auth.api.getSession({
		headers: await import("next/headers").then((mod) => mod.headers()),
	})

	if (!session?.user?.id) {
		return {
			success: false,
			error: "No autenticado",
		}
	}

	const userId = session.user.id

	let userSafetyTalk = await prisma.userSafetyTalk.findFirst({
		where: {
			userId,
			category,
		},
		include: {
			attempts: {
				orderBy: {
					attemptNumber: "desc",
				},
				take: 1,
			},
		},
	})

	const validatedAnswers = answers.map((ans) => {
		const isTrueFalse = ans.questionId > 100
		const isCorrect = validateAnswer(
			category,
			ans.questionId,
			ans.answer,
			isTrueFalse,
			selectedQuestions
		)
		return {
			...ans,
			isCorrect,
			isTrueFalse,
		}
	})

	const score = calculateScore(
		category,
		validatedAnswers.map((a) => ({
			questionId: a.questionId,
			answer: a.answer,
			isTrueFalse: a.isTrueFalse,
		})),
		selectedQuestions
	)

	const requiredScore = category === "IRL" ? 100 : 70
	const passed = score >= requiredScore

	if (!userSafetyTalk) {
		userSafetyTalk = await prisma.userSafetyTalk.create({
			data: {
				userId,
				category,
				status: "IN_PROGRESS",
				currentAttempts: 0,
				startedAt: new Date(),
			},
			include: {
				attempts: true,
			},
		})
	}

	const attemptNumber = userSafetyTalk.currentAttempts + 1

	const attempt = await prisma.safetyTalkAttempt.create({
		data: {
			userId,
			userSafetyTalkId: userSafetyTalk.id,
			category,
			score,
			passed,
			answers: validatedAnswers,
			attemptNumber,
			completedAt: new Date(),
			timeSpentSeconds,
		},
	})

 await logActivity({
		userId,
		module: MODULES.SAFETY_TALK,
		action: ACTIVITY_TYPE.SUBMIT,
		entityId: attempt.id,
		entityType: "SafetyTalkAttempt",
		metadata: {
			category,
			score,
			passed,
			attemptNumber,
			userSafetyTalkId: userSafetyTalk.id,
			timeSpentSeconds,
		},
	})

	if (passed) {
		const expiresAt = new Date()
		expiresAt.setFullYear(expiresAt.getFullYear() + 1)

		await prisma.userSafetyTalk.update({
			where: { id: userSafetyTalk.id },
			data: {
				status: "PASSED",
				currentAttempts: attemptNumber,
				lastAttemptAt: new Date(),
				score,
				completedAt: new Date(),
				expiresAt,
				nextAttemptAt: null,
			},
		})

		if (category === "IRL") {
			try {
				const uploadResult = await uploadCertificateToStartupFolders(userSafetyTalk.id, userId)
				if (uploadResult.success) {
					console.log(
						`Certificate automatically uploaded to ${uploadResult.uploadedToFolders?.basicFolders || 0} basic folders and ${uploadResult.uploadedToFolders?.workerFolders || 0} worker folders`
					)
				} else {
					console.error("Failed to upload certificate:", uploadResult.error)
				}
			} catch (error) {
				console.error("Error uploading certificate to startup folders:", error)
			}
		}

		return {
			success: true,
			passed: true,
			score,
			attemptNumber,
			expiresAt,
			validatedAnswers,
			message: "¡Felicitaciones! Has aprobado la evaluación",
		}
	} else {
		await prisma.userSafetyTalk.update({
			where: { id: userSafetyTalk.id },
			data: {
				status: "FAILED",
				currentAttempts: attemptNumber,
				lastAttemptAt: new Date(),
				nextAttemptAt: null,
				score,
			},
		})

		const requiredScoreText = category === "IRL" ? "100%" : "70%"
		return {
			success: true,
			passed: false,
			score,
			attemptNumber,
			nextAttemptAt: null,
			isPermanentlyBlocked: false,
			validatedAnswers,
			message: `No has aprobado. Necesitas ${requiredScoreText} para aprobar. Puedes intentar nuevamente.`,
		}
	}
}

async function processExternalUserEvaluation(
	token: string,
	email: string,
	category: SAFETY_TALK_CATEGORY,
	answers: Array<{ questionId: number; answer: string; isCorrect?: boolean }>,
	timeSpentSeconds?: number,
	selectedQuestions?: Question[]
) {
	const visitorTalk = await prisma.visitorTalk.findUnique({
		where: { uniqueToken: token },
	})

	if (!visitorTalk) {
		return {
			success: false,
			error: "Invitación no encontrada",
		}
	}

	if (visitorTalk.expiresAt && visitorTalk.expiresAt < new Date()) {
		return {
			success: false,
			error: "La invitación ha expirado",
		}
	}

	const visitor = await prisma.externalVisitor.findFirst({
		where: {
			email,
			companyId: visitorTalk.companyId,
		},
	})

	if (!visitor) {
		return {
			success: false,
			error: "Usuario no encontrado. Por favor completa tus datos primero.",
		}
	}

	let completion = await prisma.visitorTalkCompletion.findUnique({
		where: {
			visitorId_visitorTalkId: {
				visitorId: visitor.id,
				visitorTalkId: visitorTalk.id,
			},
		},
	})

	if (completion?.status === "COMPLETED" && completion.passed) {
		return {
			success: false,
			error: "Ya has completado esta evaluación exitosamente",
		}
	}

	const validatedAnswers = answers.map((ans) => {
		const isTrueFalse = ans.questionId > 100
		const isCorrect = validateAnswer(
			category,
			ans.questionId,
			ans.answer,
			isTrueFalse,
			selectedQuestions
		)
		return {
			...ans,
			isCorrect,
			isTrueFalse,
		}
	})

	const score = calculateScore(
		category,
		validatedAnswers.map((a) => ({
			questionId: a.questionId,
			answer: a.answer,
			isTrueFalse: a.isTrueFalse,
		})),
		selectedQuestions
	)

	const requiredScore = category === "IRL" ? 100 : 70
	const passed = score >= requiredScore

	if (completion) {
		completion = await prisma.visitorTalkCompletion.update({
			where: { id: completion.id },
			data: {
				status: "COMPLETED",
				completedAt: new Date(),
				score,
				passed,
				answers: validatedAnswers,
				timeSpentSeconds,
				attemptNumber: completion.attemptNumber + 1,
			},
		})
	} else {
		completion = await prisma.visitorTalkCompletion.create({
			data: {
				visitorId: visitor.id,
				visitorTalkId: visitorTalk.id,
				status: "COMPLETED",
				completedAt: new Date(),
				score,
				passed,
				answers: validatedAnswers,
				timeSpentSeconds,
				attemptNumber: 1,
			},
		})
	}

	return {
		success: true,
		passed,
		score,
		isExternal: true,
		completionId: completion.id,
		validatedAnswers,
		message: passed
			? "¡Felicitaciones! Has aprobado la evaluación. Descarga tu certificado."
			: "No has aprobado la evaluación. Contacta al administrador para más información.",
	}
}
