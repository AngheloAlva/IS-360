import { z } from "zod"

import { SAFETY_TALK_CATEGORY, SAFETY_TALK_STATUS } from "@/generated/prisma/enums"

export const inPersonSafetyTalkSchema = z.object({
	rut: z.string().min(7, "El RUT debe tener al menos 7 caracteres"),
	name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
	company: z.string().min(2, "La empresa debe tener al menos 2 caracteres"),
	category: z.nativeEnum(SAFETY_TALK_CATEGORY).optional(),
	sessionDate: z.coerce.date({
		error: "La fecha de sesión es requerida",
	}),
	expiresAt: z.coerce.date().optional(),
	score: z.coerce.number().min(0).max(100).optional(),
	notes: z.string().optional(),
	status: z
		.nativeEnum(SAFETY_TALK_STATUS)
		.optional()
		.default(SAFETY_TALK_STATUS.PASSED),
})

export type InPersonSafetyTalkSchema = z.infer<typeof inPersonSafetyTalkSchema>
