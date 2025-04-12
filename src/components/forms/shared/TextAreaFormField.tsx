"use client"

import { cn } from "@/lib/utils"

import { FormItem, FormLabel, FormField, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

import type { Control, FieldValues, Path } from "react-hook-form"

interface TextAreaFormFieldProps<T extends FieldValues> {
	name: Path<T>
	label: string
	className?: string
	control: Control<T>
	placeholder?: string
	itemClassName?: string
}

export function TextAreaFormField<T extends FieldValues>({
	name,
	label,
	control,
	className,
	placeholder,
	itemClassName,
}: TextAreaFormFieldProps<T>) {
	return (
		<FormField
			name={name}
			control={control}
			render={({ field }) => (
				<FormItem className={itemClassName}>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<Textarea
							className={cn("h-24 w-full text-sm", className)}
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
