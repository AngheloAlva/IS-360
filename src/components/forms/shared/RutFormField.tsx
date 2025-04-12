"use client"

import { formatRut } from "@/utils/formatRut"
import { cn } from "@/lib/utils"

import { FormItem, FormLabel, FormField, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import type { Control, FieldValues, Path } from "react-hook-form"

interface RutFormFieldProps<T extends FieldValues> {
	name: Path<T>
	label: string
	className?: string
	control: Control<T>
	placeholder?: string
}

export function RutFormField<T extends FieldValues>({
	name,
	label,
	control,
	className,
	placeholder,
}: RutFormFieldProps<T>) {
	return (
		<FormField
			name={name}
			control={control}
			render={({ field }) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { onChange, ...restFieldProps } = field

				return (
					<FormItem>
						<FormLabel>{label}</FormLabel>
						<FormControl>
							<Input
								type="text"
								className={cn("w-full text-sm", className)}
								placeholder={placeholder || label}
								onChange={(e) => {
									field.onChange(formatRut(e.target.value))
								}}
								{...restFieldProps}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)
			}}
		/>
	)
}
