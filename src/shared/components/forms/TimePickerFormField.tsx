"use client"

import { cn } from "@/lib/utils"

import { Input } from "../ui/input"
import {
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription,
} from "@/shared/components/ui/form"

import type { Control, FieldValues, Path } from "react-hook-form"
import { Clock2Icon } from "lucide-react"

interface TimePickerFormFieldProps<T extends FieldValues> {
	name: Path<T>
	label: string
	optional?: boolean
	disabled?: boolean
	readOnly?: boolean
	control: Control<T>
	description?: string
	placeholder?: string
	className?: React.ComponentProps<"div">["className"]
	itemClassName?: React.ComponentProps<"div">["className"]
}

export function TimePickerFormField<T extends FieldValues>({
	name,
	label,
	control,
	className,
	description,
	itemClassName,
	optional = false,
	disabled = false,
	readOnly = false,
	placeholder = "",
}: TimePickerFormFieldProps<T>) {
	return (
		<FormField
			name={name}
			control={control}
			render={({ field }) => (
				<FormItem className={cn("content-start", itemClassName)}>
					<FormLabel className="gap-1">
						{label}
						{optional && <span className="text-muted-foreground"> (opcional)</span>}
					</FormLabel>
					<FormControl>
						<div className="relative flex w-full items-center gap-2">
							<Clock2Icon className="text-muted-foreground pointer-events-none absolute left-2.5 size-4 select-none" />

							<Input
								step={1}
								type="time"
								disabled={disabled}
								readOnly={readOnly}
								className={cn(
									"w-full appearance-none pl-8 text-sm [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
									className
								)}
								placeholder={placeholder || label}
								{...field}
							/>
						</div>
					</FormControl>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
