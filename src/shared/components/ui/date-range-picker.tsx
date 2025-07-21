"use client"

import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import * as React from "react"

import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Calendar } from "@/shared/components/ui/calendar"
import { Button } from "@/shared/components/ui/button"

interface CalendarDateRangePickerProps {
	value?: DateRange | null
	onChange?: (date: DateRange | null) => void
}

export function CalendarDateRangePicker({ value, onChange }: CalendarDateRangePickerProps) {
	return (
		<div className={cn("grid gap-2")}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id="date"
						variant={"outline"}
						className={cn(
							"border-input bg-background w-fit justify-start text-left font-normal",
							!value && "text-muted-foreground"
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{value?.from ? (
							value.to ? (
								<>
									{format(value.from, "LLL dd, y", { locale: es })} -{" "}
									{format(value.to, "LLL dd, y", { locale: es })}
								</>
							) : (
								format(value.from, "LLL dd, y", { locale: es })
							)
						) : (
							<span>Seleccionar rango de fechas</span>
						)}
					</Button>
				</PopoverTrigger>

				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="range"
						captionLayout={"dropdown"}
						defaultMonth={value?.from}
						selected={value ?? undefined}
						fromYear={2024}
						onSelect={(newDate) => {
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
