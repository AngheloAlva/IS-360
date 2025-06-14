"use client"

import {
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription,
} from "@/shared/components/ui/form"
import MultipleSelector from "@/shared/components/ui/multiselect"

import type { Control, FieldValues, Path } from "react-hook-form"

interface MultiSelectFormFieldProps<T extends FieldValues> {
	name: Path<T>
	label: string
	className?: string
	control: Control<T>
	placeholder?: string
	description?: string
	itemClassName?: string
	options: { value: string; label: string }[]
}

export function MultiSelectFormField<T extends FieldValues>({
	name,
	label,
	options,
	control,
	className,
	placeholder,
	description,
	itemClassName,
}: MultiSelectFormFieldProps<T>) {
	return (
		<FormField
			name={name}
			control={control}
			render={({ field }) => (
				<FormItem className={itemClassName}>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<MultipleSelector
							className={className}
							value={options.filter((option) => field.value.includes(option.value))}
							placeholder={placeholder || label}
							options={options}
							commandProps={{
								label: label,
							}}
							hideClearAllButton
							hidePlaceholderWhenSelected
							emptyIndicator={<p className="text-center text-sm">No hay opciones disponibles</p>}
							onChange={(options) => {
								field.onChange(options.map((option) => option.value))
							}}
						/>
					</FormControl>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
