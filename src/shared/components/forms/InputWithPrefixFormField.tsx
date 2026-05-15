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
	position?: "start" | "end"
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
	position = "start",
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

					<div
						className={cn("flex flex-row-reverse items-center", {
							"flex-row": position === "start",
						})}
					>
						<div
							className={cn(
								"bg-input/30 text-muted-foreground flex h-8 items-center border px-1 text-sm",
								position === "start" ? "rounded-l-md border-r-0" : "rounded-r-md border-l-0"
							)}
						>
							{prefix}
						</div>

						<FormControl>
							<Input
								min={min}
								max={max}
								type={type}
								disabled={disabled}
								className={cn(
									"w-full text-sm",
									{
										"rounded-l-none": position === "start",
										"rounded-r-none": position === "end",
									},
									className
								)}
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
