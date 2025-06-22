import { ArrowDown01Icon, ArrowDown10Icon, ArrowDownAZIcon, ArrowDownZAIcon } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"

import {
	Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent,
} from "@/shared/components/ui/select"

export default function OrderByButton({
	onChange,
	className,
	initialOrder = "desc",
	initialOrderBy = "name",
}: {
	className?: string
	initialOrder?: Order
	initialOrderBy?: OrderBy
	onChange: (orderBy: OrderBy, order: Order) => void
}): React.ReactElement {
	const [value, setValue] = useState(`${initialOrderBy}-${initialOrder}`)

	const handleValueChange = (newValue: string) => {
		setValue(newValue)
		const [orderBy, order] = newValue.split("-") as [OrderBy, Order]
		onChange(orderBy, order)
	}

	return (
		<Select value={value} onValueChange={handleValueChange}>
			<SelectTrigger className={cn("bg-background h-9 w-fit", className)}>
				<SelectValue placeholder="Ordenar por" />
			</SelectTrigger>

			<SelectContent>
				<SelectItem value="name-desc">
					<ArrowDown10Icon className="size-4" /> Nombre Desc.
				</SelectItem>
				<SelectItem value="name-asc">
					<ArrowDownZAIcon className="size-4" /> Nombre Asc.
				</SelectItem>
				<SelectItem value="createdAt-asc">
					<ArrowDownAZIcon className="size-4" /> Fecha de creación Asc.
				</SelectItem>
				<SelectItem value="createdAt-desc">
					<ArrowDown01Icon className="size-4" /> Fecha de creación Desc.
				</SelectItem>
			</SelectContent>
		</Select>
	)
}

export type OrderBy = "name" | "createdAt"
export type Order = "asc" | "desc"
