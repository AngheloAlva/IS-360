import { z } from "zod"

export const milestoneTaskSchema = z.object({
	id: z.string().optional(),
	name: z.string().nonempty({ message: "El nombre de la tarea no puede estar vacío" }),
	description: z.string().optional(),
	order: z.string().optional(),
	isCompleted: z.boolean().optional().default(false),
	estimatedHours: z.string().optional(),
	estimatedPeople: z.string().optional(),
	plannedDate: z.date().optional(),
	activityStartTime: z.string().optional(),
	activityEndTime: z.string().optional(),
})

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
		tasks: z.array(milestoneTaskSchema).min(1, {
			message: "Debe agregar al menos una tarea al hito",
		}),
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
	.superRefine((data, ctx) => {
		if (data.startDate) {
			const startDate = data.startDate
			if (data.tasks.some((task) => task.plannedDate && task.plannedDate < startDate)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Hay tareas planeadas para antes que la fecha de inicio del hito",
					path: ["startDate"],
				})
			}
		}

		if (data.endDate) {
			const endDate = data.endDate
			if (data.tasks.some((task) => task.plannedDate && task.plannedDate > endDate)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Hay tareas planeadas para después de la fecha de finalización del hito",
					path: ["endDate"],
				})
			}
		}
	})

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

export type MilestoneTaskSchema = z.infer<typeof milestoneTaskSchema>
export type MilestoneSchema = z.infer<typeof milestoneSchema>
export type WorkBookMilestonesSchema = z.infer<typeof workBookMilestonesSchema>
