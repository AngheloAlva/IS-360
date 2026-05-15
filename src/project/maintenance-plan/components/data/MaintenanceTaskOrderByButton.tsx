import { useState } from "react"
import {
	ClockIcon,
	CalendarIcon,
	ArrowDown01Icon,
	ArrowDown10Icon,
	ArrowDownAZIcon,
	ArrowDownZAIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

import {
	Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent,
} from "@/shared/components/ui/select"

export default function MaintenanceTaskOrderByButton({
	onChange,
	className,
	initialOrder = "desc",
	initialOrderBy = "name",
}: {
	className?: string
	initialOrder?: MaintenanceTaskOrder
	initialOrderBy?: MaintenanceTaskOrderBy
	onChange: (orderBy: MaintenanceTaskOrderBy, order: MaintenanceTaskOrder) => void
}): React.ReactElement {
	const [value, setValue] = useState(`${initialOrderBy}-${initialOrder}`)

	const handleValueChange = (newValue: string) => {
		setValue(newValue)
		const [orderBy, order] = newValue.split("-") as [MaintenanceTaskOrderBy, MaintenanceTaskOrder]
		onChange(orderBy, order)
	}

	return (
		<Select value={value} onValueChange={handleValueChange}>
			<SelectTrigger className={cn("bg-background h-9 w-fit", className)}>
				<SelectValue placeholder="Ordenar por" />
			</SelectTrigger>

			<SelectContent>
				<SelectItem value="name-desc">
					<ArrowDownAZIcon className="size-4" />
					Nombre Desc.
				</SelectItem>
				<SelectItem value="name-asc">
					<ArrowDownZAIcon className="size-4" />
					Nombre Asc.
				</SelectItem>
				<SelectItem value="nextDate-asc">
					<CalendarIcon className="size-4" />
					Próxima Ejecución Asc.
				</SelectItem>
				<SelectItem value="nextDate-desc">
					<CalendarIcon className="size-4" />
					Próxima Ejecución Desc.
				</SelectItem>
				<SelectItem value="frequency-asc">
					<ClockIcon className="size-4" />
					Frecuencia Asc.
				</SelectItem>
				<SelectItem value="frequency-desc">
					<ClockIcon className="size-4" />
					Frecuencia Desc.
				</SelectItem>
				<SelectItem value="createdAt-asc">
					<ArrowDown10Icon className="size-4" />
					Fecha de creación Asc.
				</SelectItem>
				<SelectItem value="createdAt-desc">
					<ArrowDown01Icon className="size-4" />
					Fecha de creación Desc.
				</SelectItem>
			</SelectContent>
		</Select>
	)
}

export type MaintenanceTaskOrderBy = "name" | "createdAt" | "nextDate" | "frequency"
export type MaintenanceTaskOrder = "asc" | "desc"
