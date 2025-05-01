import { MODULES } from "@prisma/client"

export const ModulesValuesArray = [
	MODULES.ALL,
	MODULES.EQUIPMENT,
	MODULES.SAFETY_TALK,
	MODULES.WORK_ORDERS,
	MODULES.WORK_PERMITS,
	MODULES.DOCUMENTATION,
	MODULES.NONE,
] as const

export const ModuleOptions = [
	{
		value: MODULES.ALL,
		label: "Todos",
	},
	{
		value: MODULES.EQUIPMENT,
		label: "Equipos",
	},
	{
		value: MODULES.SAFETY_TALK,
		label: "Charlas de seguridad",
	},
	{
		value: MODULES.WORK_ORDERS,
		label: "Ordenes de trabajo",
	},
	{
		value: MODULES.WORK_PERMITS,
		label: "Permisos de trabajo",
	},
	{
		value: MODULES.DOCUMENTATION,
		label: "Documentacion",
	},
	{
		value: MODULES.NONE,
		label: "Ninguno",
	},
]

export const ModulesLabels = {
	[MODULES.ALL]: "Todos",
	[MODULES.EQUIPMENT]: "Equipos",
	[MODULES.SAFETY_TALK]: "Charlas de seguridad",
	[MODULES.WORK_ORDERS]: "Ordenes de trabajo",
	[MODULES.WORK_PERMITS]: "Permisos de trabajo",
	[MODULES.DOCUMENTATION]: "Documentacion",
	[MODULES.NONE]: "Ninguno",
}
