import { z } from "zod"

import { QUESTION_TYPES } from "@/lib/consts/safety-talks"

// Schema para opciones de pregunta
export const questionOptionSchema = z.object({
	id: z.string().optional(),
	text: z.string().min(3, "El texto de la opción debe tener al menos 3 caracteres"),
	isCorrect: z.boolean().default(false),
	zoneLabel: z.string().optional(),
	zoneId: z.string().optional(),
	order: z.string().regex(/^[0-9]+$/, "Debe ser un número"),
})

// Schema para preguntas
export const questionSchema = z.object({
	id: z.string().optional(),
	type: z.enum([
		QUESTION_TYPES.MULTIPLE_CHOICE,
		QUESTION_TYPES.IMAGE_ZONES,
		QUESTION_TYPES.TRUE_FALSE,
		QUESTION_TYPES.SHORT_ANSWER,
	]),
	question: z.string().min(3, "La pregunta debe tener al menos 3 caracteres"),
	imageUrl: z.string().url("URL inválida").optional(),
	description: z.string().optional(),
	options: z.array(questionOptionSchema).min(1, "Debe haber al menos una opción"),
})

// Schema principal para charla de seguridad
export const safetyTalkResourceSchema = z.object({
	title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
	type: z.enum(["VIDEO", "PRESENTATION", "DOCUMENT"]),
	url: z.string().url("URL inválida").optional(),
	fileSize: z.number(),
	mimeType: z.string(),
	file: z.instanceof(File).optional(),
	preview: z
		.string()
		.regex(/^data:image\/(jpeg|png|gif|webp);base64,/)
		.or(z.string().url())
		.optional(),
})

export const safetyTalkSchema = z.object({
	title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
	description: z.string().optional(),
	isPresential: z.boolean().default(false),
	timeLimit: z
		.string()
		.regex(/^[0-9]+$/, "Debe ser un número")
		.min(1, "El tiempo límite debe ser mayor a 0")
		.optional(),
	minimumScore: z
		.string()
		.regex(/^[0-9]+$/, "Debe ser un número")
		.default("70"),
	expiresAt: z.date(),
	questions: z.array(questionSchema).optional().default([]),
	resources: z.array(safetyTalkResourceSchema).optional().default([]),
})

export type SafetyTalkSchema = z.infer<typeof safetyTalkSchema>

export type QuestionSchema = z.infer<typeof questionSchema>

export type QuestionOptionSchema = z.infer<typeof questionOptionSchema>
