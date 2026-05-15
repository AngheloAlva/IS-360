"use client"

import { cn } from "@/lib/utils"

import { Input } from "@/shared/components/ui/input"
import {
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription,
} from "@/shared/components/ui/form"

import type { Control, FieldValues, Path } from "react-hook-form"
import type { HTMLInputTypeAttribute } from "react"

interface InputFormFieldProps<T extends FieldValues> {
	min?: number
	max?: number
	label: string
	step?: number
	name: Path<T>
	readOnly?: boolean
	disabled?: boolean
	optional?: boolean
	control: Control<T>
	placeholder?: string
	description?: string
	type?: HTMLInputTypeAttribute
	className?: React.ComponentProps<"div">["className"]
	itemClassName?: React.ComponentProps<"div">["className"]
}

export function InputFormField<T extends FieldValues>({
	min,
	max,
	step,
	name,
	label,
	control,
	className,
	placeholder,
	description,
	itemClassName,
	type = "text",
	disabled = false,
	readOnly = false,
	optional = false,
}: InputFormFieldProps<T>) {
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
						<Input
							min={min}
							max={max}
							type={type}
							step={step}
							disabled={disabled}
							readOnly={readOnly}
							className={cn("w-full text-sm", className)}
							placeholder={placeholder || label}
							{...field}
						/>
					</FormControl>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
