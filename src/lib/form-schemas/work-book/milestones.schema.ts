import { z } from "zod"

export const milestoneSchema = z
	.object({
		id: z.string().optional(),
		name: z.string().nonempty({ message: "El nombre del hito no puede estar vacío" }),
		description: z.string().optional(),
		order: z.string().optional(),
		weight: z.string().refine(
			(value) => {
				const num = Number(value)
				return !isNaN(num) && num > 0
			},
			{
				message: "El peso del hito debe ser un número mayor a 0",
			}
		),
		startDate: z.date().optional(),
		endDate: z.date().optional(),
	})
	.refine(
		(data) => {
			if (data.startDate && data.endDate) {
				return data.endDate >= data.startDate
			}
			return true
		},
		{
			message: "La fecha de finalización del hito debe ser posterior a la fecha de inicio",
			path: ["endDate"],
		}
	)

export const workBookMilestonesSchema = z
	.object({
		workOrderId: z.string().nonempty({ message: "El ID del libro de obras es requerido" }),
		milestones: z.array(milestoneSchema).min(1, {
			message: "Debe agregar al menos un hito",
		}),
	})
	.superRefine((data, ctx) => {
		const totalWeight = data.milestones.reduce((sum, milestone) => {
			return sum + Number(milestone.weight || 0)
		}, 0)

		if (totalWeight !== 100) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `La suma de los pesos de los hitos debe ser 100%. Actualmente es ${totalWeight}%`,
				path: ["milestones"],
			})
		}
	})

export type WorkBookMilestonesSchema = z.infer<typeof workBookMilestonesSchema>
export type MilestoneSchema = z.infer<typeof milestoneSchema>
