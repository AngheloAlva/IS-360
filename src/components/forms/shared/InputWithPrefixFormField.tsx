"use client"

import { cn } from "@/lib/utils"

import { Input } from "@/components/ui/input"
import {
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription,
} from "@/components/ui/form"

import type { Control, FieldValues, Path } from "react-hook-form"
import type { HTMLInputTypeAttribute } from "react"

interface InputWithPrefixFormFieldProps<T extends FieldValues> {
	min?: number
	max?: number
	label: string
	name: Path<T>
	prefix: string
	className?: string
	disabled?: boolean
	optional?: boolean
	control: Control<T>
	placeholder?: string
	description?: string
	itemClassName?: string
	type?: HTMLInputTypeAttribute
}

export function InputWithPrefixFormField<T extends FieldValues>({
	min,
	max,
	name,
	label,
	prefix,
	control,
	className,
	placeholder,
	description,
	itemClassName,
	type = "text",
	disabled = false,
	optional = false,
}: InputWithPrefixFormFieldProps<T>) {
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

					<div className="flex items-center">
						<div className="flex px-1 bg-input/30 text-sm border-r-0 text-muted-foreground h-full rounded-l-md border items-center">
							{prefix}
						</div>
						<FormControl>
							<Input
								min={min}
								max={max}
								type={type}
								disabled={disabled}
								className={cn("w-full rounded-l-none text-sm", className)}
								placeholder={placeholder || label}
								{...field}
							/>
						</FormControl>

					</div>

					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
