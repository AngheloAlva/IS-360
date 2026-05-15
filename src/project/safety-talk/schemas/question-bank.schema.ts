import { z } from "zod"

export const safetyTalkQuestionSchema = z.object({
	id: z.number().int().positive(),
	pregunta: z.string().min(1),
	opciones: z.array(z.string().min(1)).min(2),
	correcta: z.string().min(1),
})

export const safetyTalkQuestionBankSchema = z.array(safetyTalkQuestionSchema)

export const safetyTalkTrueFalseQuestionSchema = z.object({
	id: z.number().int().positive(),
	pregunta: z.string().min(1),
	correcta: z.enum(["true", "false"]),
})

export const safetyTalkTrueFalseQuestionBankSchema = z.array(safetyTalkTrueFalseQuestionSchema)

export type SafetyTalkQuestion = z.infer<typeof safetyTalkQuestionSchema>
export type SafetyTalkTrueFalseQuestion = z.infer<typeof safetyTalkTrueFalseQuestionSchema>
