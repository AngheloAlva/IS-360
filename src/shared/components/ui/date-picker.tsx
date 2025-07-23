"use client"

import { Calendar as CalendarIcon } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import * as React from "react"

import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Calendar } from "@/shared/components/ui/calendar"
import { Button } from "@/shared/components/ui/button"

interface CalendarDatePickerProps {
	value?: Date | null
	onChange?: (date: Date | null) => void
	placeholder?: string
}

export function CalendarDatePicker({
	value,
	onChange,
	placeholder = "Seleccionar fecha",
}: CalendarDatePickerProps) {
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
						{value ? format(value, "LLL dd, y", { locale: es }) : <span>{placeholder}</span>}
					</Button>
				</PopoverTrigger>

				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						captionLayout={"dropdown"}
						defaultMonth={value ?? undefined}
						selected={value ?? undefined}
						fromYear={2024}
						onSelect={(newDate) => {
							onChange?.(newDate ?? null)
						}}
						locale={es}
					/>
				</PopoverContent>
			</Popover>
		</div>
	)
}
