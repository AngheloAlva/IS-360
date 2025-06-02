import { CRITICALITY } from "@prisma/client"

export const CRITICALITY_ARRAY = [
	CRITICALITY.CRITICAL,
	CRITICALITY.SEMICRITICAL,
	CRITICALITY.UNCITICAL,
] as const

export const CriticalityLabels = {
	[CRITICALITY.CRITICAL]: "Crítico",
	[CRITICALITY.SEMICRITICAL]: "Semicrítico",
	[CRITICALITY.UNCITICAL]: "No crítico",
} as const

export const CriticalityOptions = [
	{
		value: CRITICALITY.CRITICAL,
		label: CriticalityLabels.CRITICAL,
	},
	{
		value: CRITICALITY.SEMICRITICAL,
		label: CriticalityLabels.SEMICRITICAL,
	},
	{
		value: CRITICALITY.UNCITICAL,
		label: CriticalityLabels.UNCITICAL,
	},
]
