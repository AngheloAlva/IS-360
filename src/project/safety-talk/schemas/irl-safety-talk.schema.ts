import { z } from "zod"

const employeeSchema = z
	.object({
		userId: z.string(),
		name: z.string().optional(),
		talksId: z.string().optional(),
		sessionDate: z.coerce.date().optional(),
		expiresAt: z.coerce.date().optional(),
		approved: z.boolean().default(false),
		score: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (!data.approved) return

		if (!data.sessionDate) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "La fecha de la sesión es requerida",
				path: ["sessionDate"],
			})
		}

		if (!data.expiresAt) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "La fecha de expiración es requerida",
				path: ["expiresAt"],
			})
		}

		if (!data.score) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "El puntaje es requerido",
				path: ["score"],
			})
		} else if (!/^[0-9]+$/.test(data.score)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Debe ser un número",
				path: ["score"],
			})
		} else {
			const num = parseInt(data.score)
			if (num < 0 || num > 100) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "El puntaje debe ser entre 0 y 100",
					path: ["score"],
				})
			}
		}
	})

export const irlSafetyTalkSchema = z.object({
	companyId: z.string({
		error: "La empresa es requerida",
	}),
	employees: z.array(employeeSchema),
})

export type IrlSafetyTalkSchema = z.infer<typeof irlSafetyTalkSchema>
