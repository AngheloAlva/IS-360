import { TASK_SPECIALTY } from "@/generated/prisma/enums"

export const TaskSpecialtyOptions = [
	{
		label: "Eléctrica",
		value: TASK_SPECIALTY.ELECTRIC,
	},
	{
		label: "Mecánica",
		value: TASK_SPECIALTY.MECHANIC,
	},
	{
		label: "Instrumentación y Control",
		value: TASK_SPECIALTY.INSTRUMENTATION_CONTROL,
	},
	{
		label: "Hidráulica",
		value: TASK_SPECIALTY.HYDRAULIC,
	},
]

export const TaskSpecialtyLabels = {
	[TASK_SPECIALTY.ELECTRIC]: "Eléctrica",
	[TASK_SPECIALTY.MECHANIC]: "Mecánica",
	[TASK_SPECIALTY.INSTRUMENTATION_CONTROL]: "Instrumentación y Control",
	[TASK_SPECIALTY.HYDRAULIC]: "Hidráulica",
}
