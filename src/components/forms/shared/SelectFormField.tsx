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
import {
	Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent,
} from "@/components/ui/select"

import type { Control, FieldValues, Path } from "react-hook-form"

interface SelectFormFieldProps<T extends FieldValues> {
	name: Path<T>
	label?: string
	className?: string
	control: Control<T>
	placeholder?: string
	description?: string
	itemClassName?: string
	options: { value: string; label: string }[]
}

export function SelectFormField<T extends FieldValues>({
	name,
	label,
	options,
	control,
	className,
	description,
	placeholder,
	itemClassName,
}: SelectFormFieldProps<T>) {
	return (
		<FormField
			name={name}
			control={control}
			render={({ field }) => (
				<FormItem className={itemClassName}>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<Select onValueChange={field.onChange} defaultValue={field.value}>
							<FormControl>
								<SelectTrigger className={cn("w-full text-sm", className)}>
									<SelectValue placeholder={placeholder || label} />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{options.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</FormControl>
					<FormDescription>{description}</FormDescription>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
