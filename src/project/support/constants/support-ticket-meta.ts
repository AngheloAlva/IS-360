import {
	AlertTriangleIcon,
	CheckCircle2Icon,
	CircleDashedIcon,
	CircleXIcon,
	FlagIcon,
} from "lucide-react"

import {
	SUPPORT_TICKET_PRIORITY,
	SUPPORT_TICKET_STATUS,
	SUPPORT_TICKET_TYPE,
} from "@/generated/prisma/enums"

export const SUPPORT_STATUS_LABELS = {
	[SUPPORT_TICKET_STATUS.REPORTED]: "Reportado",
	[SUPPORT_TICKET_STATUS.IN_PROGRESS]: "En proceso",
	[SUPPORT_TICKET_STATUS.RESOLVED]: "Resuelto",
	[SUPPORT_TICKET_STATUS.REJECTED]: "Rechazado",
} as const

export const SUPPORT_TYPE_OPTIONS = [
	{ value: SUPPORT_TICKET_TYPE.INCIDENT, label: "Incidencia" },
	{ value: SUPPORT_TICKET_TYPE.IMPROVEMENT, label: "Mejora" },
	{ value: SUPPORT_TICKET_TYPE.QUERY, label: "Consulta" },
] as const

export const SUPPORT_PRIORITY_OPTIONS = [
	{ value: SUPPORT_TICKET_PRIORITY.HIGH, label: "Alta" },
	{ value: SUPPORT_TICKET_PRIORITY.MEDIUM, label: "Media" },
	{ value: SUPPORT_TICKET_PRIORITY.LOW, label: "Baja" },
] as const

export const SUPPORT_STATUS_OPTIONS = [
	{ value: SUPPORT_TICKET_STATUS.REPORTED, label: "Reportado" },
	{ value: SUPPORT_TICKET_STATUS.IN_PROGRESS, label: "En proceso" },
	{ value: SUPPORT_TICKET_STATUS.RESOLVED, label: "Resuelto" },
	{ value: SUPPORT_TICKET_STATUS.REJECTED, label: "Rechazado" },
] as const

export const SUPPORT_PRIORITY_META = {
	[SUPPORT_TICKET_PRIORITY.HIGH]: {
		label: "Alta",
		className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
		iconClassName: "text-red-600 dark:text-red-300",
		icon: AlertTriangleIcon,
	},
	[SUPPORT_TICKET_PRIORITY.MEDIUM]: {
		label: "Media",
		className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300",
		iconClassName: "text-yellow-600 dark:text-yellow-300",
		icon: FlagIcon,
	},
	[SUPPORT_TICKET_PRIORITY.LOW]: {
		label: "Baja",
		className: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
		iconClassName: "text-blue-600 dark:text-blue-300",
		icon: FlagIcon,
	},
} as const

export const SUPPORT_STATUS_META = {
	[SUPPORT_TICKET_STATUS.REPORTED]: {
		label: "Reportado",
		className: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
		iconClassName: "text-slate-600 dark:text-slate-300",
		icon: CircleDashedIcon,
	},
	[SUPPORT_TICKET_STATUS.IN_PROGRESS]: {
		label: "En proceso",
		className: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
		iconClassName: "text-amber-600 dark:text-amber-300",
		icon: CircleDashedIcon,
	},
	[SUPPORT_TICKET_STATUS.RESOLVED]: {
		label: "Resuelto",
		className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
		iconClassName: "text-emerald-600 dark:text-emerald-300",
		icon: CheckCircle2Icon,
	},
	[SUPPORT_TICKET_STATUS.REJECTED]: {
		label: "Rechazado",
		className: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
		iconClassName: "text-rose-600 dark:text-rose-300",
		icon: CircleXIcon,
	},
} as const
