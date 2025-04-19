"use client"

import { cn } from "@/lib/utils"

import { FormItem, FormLabel, FormField, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

import type { Control, FieldValues, Path } from "react-hook-form"

interface TextAreaFormFieldProps<T extends FieldValues> {
	name: Path<T>
	label: string
	className?: string
	disabled?: boolean
	optional?: boolean
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
	disabled = false,
	optional = false,
}: TextAreaFormFieldProps<T>) {
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
						<Textarea
							disabled={disabled}
							placeholder={placeholder || label}
							className={cn("h-24 w-full text-sm", className)}
							{...field}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
