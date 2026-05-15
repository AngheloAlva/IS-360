import { TASK_TYPE } from "@/generated/prisma/enums"

export const TaskTypeOptions = [
	{
		label: "Limpieza",
		value: TASK_TYPE.CLEANING,
	},
	{
		label: "Inspección",
		value: TASK_TYPE.INSPECTION,
	},
	{
		label: "Lubricación",
		value: TASK_TYPE.LUBRICATION,
	},
	{
		label: "Ajustes",
		value: TASK_TYPE.ADJUSTMENTS,
	},
]

export const TaskTypeLabels = {
	[TASK_TYPE.CLEANING]: "Limpieza",
	[TASK_TYPE.INSPECTION]: "Inspección",
	[TASK_TYPE.LUBRICATION]: "Lubricación",
	[TASK_TYPE.ADJUSTMENTS]: "Ajustes",
}
