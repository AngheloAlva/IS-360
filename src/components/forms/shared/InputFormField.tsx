"use client"

import { cn } from "@/lib/utils"

import {
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import type { Control, FieldValues, Path } from "react-hook-form"
import type { HTMLInputTypeAttribute } from "react"

interface InputFormFieldProps<T extends FieldValues> {
	name: Path<T>
	label: string
	className?: string
	disabled?: boolean
	optional?: boolean
	control: Control<T>
	placeholder?: string
	description?: string
	itemClassName?: string
	type?: HTMLInputTypeAttribute
}

export function InputFormField<T extends FieldValues>({
	name,
	label,
	control,
	className,
	placeholder,
	description,
	itemClassName,
	type = "text",
	disabled = false,
	optional = false,
}: InputFormFieldProps<T>) {
	return (
		<FormField
			name={name}
			control={control}
			render={({ field }) => (
				<FormItem className={itemClassName}>
					<FormLabel className="gap-1">
						{label}
						{optional && <span className="text-muted-foreground"> (opcional)</span>}
					</FormLabel>
					<FormControl>
						<Input
							type={type}
							disabled={disabled}
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
