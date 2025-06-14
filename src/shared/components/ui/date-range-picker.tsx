"use client"

import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Calendar } from "@/shared/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"

interface CalendarDateRangePickerProps {
	value?: DateRange | null
	onChange?: (date: DateRange | null) => void
}

export function CalendarDateRangePicker({ value, onChange }: CalendarDateRangePickerProps) {
	const [date, setDate] = React.useState<DateRange | null>(value ?? null)

	React.useEffect(() => {
		if (value) {
			setDate(value)
		}
	}, [value])

	return (
		<div className={cn("grid gap-2")}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id="date"
						variant={"outline"}
						className={cn(
							"border-input bg-background w-fit justify-start text-left font-normal",
							!date && "text-muted-foreground"
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{date?.from ? (
							date.to ? (
								<>
									{format(date.from, "LLL dd, y", { locale: es })} -{" "}
									{format(date.to, "LLL dd, y", { locale: es })}
								</>
							) : (
								format(date.from, "LLL dd, y", { locale: es })
							)
						) : (
							<span>Seleccionar rango de fechas</span>
						)}
					</Button>
				</PopoverTrigger>

				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						initialFocus
						mode="range"
						defaultMonth={date?.from}
						selected={date ?? undefined}
						onSelect={(newDate) => {
							setDate(newDate ?? null)
							onChange?.(newDate ?? null)
						}}
						numberOfMonths={2}
						locale={es}
					/>
				</PopoverContent>
			</Popover>
		</div>
	)
}
