import { z } from "zod"

export const irlSafetyTalkSchema = z.object({
	companyId: z.string({
		required_error: "La empresa es requerida",
	}),
	employees: z.array(
		z.object({
			userId: z.string(),
			name: z.string().optional(),
			talksId: z.string().optional(),
			sessionDate: z.date({
				required_error: "La fecha de la sesión es requerida",
			}),
			expiresAt: z.date({
				required_error: "La fecha de expiración es requerida",
			}),
			approved: z.boolean().default(false).optional(),
			score: z
				.string()
				.regex(/^[0-9]+$/, "Debe ser un número")
				.refine(
					(value) => parseInt(value) >= 0 && parseInt(value) <= 100,
					"El puntaje debe ser mayor o igual a 0 y menor o igual a 100"
				),
		})
	),
})

export type IrlSafetyTalkSchema = z.infer<typeof irlSafetyTalkSchema>
