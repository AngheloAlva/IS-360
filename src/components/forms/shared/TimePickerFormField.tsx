"use client"

import { useState, useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

import {
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription,
} from "@/components/ui/form"
import {
	Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent,
} from "@/components/ui/select"

import type { Control, FieldValues, Path, ControllerRenderProps } from "react-hook-form"

interface TimePickerFormFieldProps<T extends FieldValues> {
	name: Path<T>
	label: string
	optional?: boolean
	className?: string
	control: Control<T>
	description?: string
	itemClassName?: string
	disabled?: boolean
}

const HOURS = Array.from({ length: 24 }, (_, i) => ({
	value: i.toString().padStart(2, "0"),
	label: i.toString().padStart(2, "0"),
}))

const MINUTES = Array.from({ length: 60 }, (_, i) => ({
	value: i.toString().padStart(2, "0"),
	label: i.toString().padStart(2, "0"),
}))

export function TimePickerFormField<T extends FieldValues>({
	name,
	label,
	control,
	className,
	description,
	itemClassName,
	optional = false,
	disabled = false,
}: TimePickerFormFieldProps<T>) {
	const [hours, setHours] = useState<string>("")
	const [minutes, setMinutes] = useState<string>("")
	const fieldRef = useRef<ControllerRenderProps<T, Path<T>> | null>(null)

	const handleTimeChange = (
		field: ControllerRenderProps<T, Path<T>>,
		hours: string,
		minutes: string
	) => {
		if (hours && minutes) {
			field.onChange(`${hours}:${minutes}`)
		}
	}

	useEffect(() => {
		if (fieldRef.current?.value) {
			const [h, m] = fieldRef.current.value.split(":")
			setHours(h)
			setMinutes(m)
		}
	}, [fieldRef.current?.value])

	return (
		<FormField
			name={name}
			control={control}
			render={({ field }) => {
				fieldRef.current = field

				return (
					<FormItem className={itemClassName}>
						<FormLabel className="gap-1">
							{label}
							{optional && <span className="text-muted-foreground"> (opcional)</span>}
						</FormLabel>
						<FormControl>
							<div className={cn("flex items-center gap-1", className)}>
								<Select
									value={hours}
									disabled={disabled}
									onValueChange={(value) => {
										setHours(value)
										handleTimeChange(field, value, minutes)
									}}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="HH" />
									</SelectTrigger>
									<SelectContent>
										{HOURS.map((hour) => (
											<SelectItem key={hour.value} value={hour.value}>
												{hour.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<span className="text-lg font-bold">:</span>

								<Select
									value={minutes}
									disabled={disabled}
									onValueChange={(value) => {
										setMinutes(value)
										handleTimeChange(field, hours, value)
									}}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="MM" />
									</SelectTrigger>
									<SelectContent>
										{MINUTES.map((minute) => (
											<SelectItem key={minute.value} value={minute.value}>
												{minute.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</FormControl>

						{description && <FormDescription>{description}</FormDescription>}
						<FormMessage />
					</FormItem>
				)
			}}
		/>
	)
}
