"use client"

import { cn } from "@/lib/utils"

import { FormItem, FormLabel, FormField, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import type { Control, FieldValues, Path } from "react-hook-form"
import type { HTMLInputTypeAttribute } from "react"

interface InputFormFieldProps<T extends FieldValues> {
	name: Path<T>
	label: string
	className?: string
	control: Control<T>
	placeholder?: string
	itemClassName?: string
	type?: HTMLInputTypeAttribute
}

export function InputFormField<T extends FieldValues>({
	name,
	label,
	control,
	className,
	placeholder,
	itemClassName,
	type = "text",
}: InputFormFieldProps<T>) {
	return (
		<FormField
			name={name}
			control={control}
			render={({ field }) => (
				<FormItem className={itemClassName}>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<Input
							type={type}
							className={cn("w-full text-sm", className)}
							placeholder={placeholder || label}
							{...field}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
