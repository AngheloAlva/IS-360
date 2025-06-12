import { ArrowDown01Icon, ArrowDown10Icon, ArrowDownAZIcon, ArrowDownZAIcon } from "lucide-react"
import { useState } from "react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

export default function OrderByButton({
	onChange,
	initialOrderBy = "name",
	initialOrder = "desc",
}: {
	onChange: (orderBy: "name" | "createdAt", order: "asc" | "desc") => void
	initialOrderBy?: "name" | "createdAt"
	initialOrder?: "asc" | "desc"
}): React.ReactElement {
	const [value, setValue] = useState(`${initialOrderBy}-${initialOrder}`)

	const handleValueChange = (newValue: string) => {
		setValue(newValue)
		const [orderBy, order] = newValue.split("-") as ["name" | "createdAt", "asc" | "desc"]
		onChange(orderBy, order)
	}

	return (
		<Select value={value} onValueChange={handleValueChange}>
			<SelectTrigger className="bg-background h-10 w-fit">
				<SelectValue placeholder="Ordenar por" />
			</SelectTrigger>

			<SelectContent>
				<SelectItem value="name-desc">
					<ArrowDown10Icon className="size-4" /> Nombre Desc
				</SelectItem>
				<SelectItem value="name-asc">
					<ArrowDownZAIcon className="size-4" /> Nombre Asc
				</SelectItem>
				<SelectItem value="createdAt-asc">
					<ArrowDownAZIcon className="size-4" /> Fecha de creación Asc
				</SelectItem>
				<SelectItem value="createdAt-desc">
					<ArrowDown01Icon className="size-4" /> Fecha de creación Desc
				</SelectItem>
			</SelectContent>
		</Select>
	)
}
