import { rutRegex } from "@/shared/schemas/rutRegex"
import { z } from "zod"

export const SafetyTalkAnswerSchema = z.object({
	questionId: z.number(),
	answer: z.string(),
	isCorrect: z.boolean().optional(),
})

export const SubmitSafetyTalkAttemptSchema = z.object({
	category: z.enum(["ENVIRONMENT", "VISITOR_TRM", "VISITOR", "IRL"]),
	answers: z.array(SafetyTalkAnswerSchema),
	timeSpentSeconds: z.number().optional(),
	invitationToken: z.string().optional(),
	email: z.string().email().optional(),
	selectedQuestions: z.array(z.any()).optional(), // Preguntas seleccionadas para validación
})

export const ExternalUserDataSchema = z.object({
	name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
	rut: z.string().min(8, "El RUT debe ser válido"),
	companyName: z.string().min(2, "El nombre de la empresa debe tener al menos 2 caracteres"),
})

export const CreateInvitationSchema = z.object({
	email: z.string().email("Email inválido"),
	category: z.enum(["VISITOR_TRM", "VISITOR"]),
	companyRut: z.string().regex(rutRegex, "El RUT debe ser válido"),
	companyName: z.string().min(2, "El nombre de la empresa debe tener al menos 2 caracteres"),
})

export const UnblockUserSchema = z.object({
	userId: z.string(),
	category: z.enum(["ENVIRONMENT", "VISITOR_TRM", "VISITOR", "IRL"]),
	reason: z.string().min(10, "La razón debe tener al menos 10 caracteres"),
})

export type SubmitSafetyTalkAttempt = z.infer<typeof SubmitSafetyTalkAttemptSchema>
export type SafetyTalkAnswer = z.infer<typeof SafetyTalkAnswerSchema>
export type ExternalUserData = z.infer<typeof ExternalUserDataSchema>
export type CreateInvitation = z.infer<typeof CreateInvitationSchema>
export type UnblockUser = z.infer<typeof UnblockUserSchema>
