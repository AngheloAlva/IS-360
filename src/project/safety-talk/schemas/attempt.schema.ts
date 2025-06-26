import { z } from "zod"

export const SafetyTalkAnswerSchema = z.object({
  questionId: z.number(),
  answer: z.string(),
})

export const SubmitSafetyTalkAttemptSchema = z.object({
  category: z.enum(["ENVIRONMENT", "IRL"]),
  answers: z.array(SafetyTalkAnswerSchema),
})

export type SubmitSafetyTalkAttempt = z.infer<typeof SubmitSafetyTalkAttemptSchema>
export type SafetyTalkAnswer = z.infer<typeof SafetyTalkAnswerSchema>
