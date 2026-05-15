"use client"

import { Slider } from "@/shared/components/ui/slider"
import {
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription,
} from "@/shared/components/ui/form"

import type { Control, FieldValues, Path } from "react-hook-form"

interface SliderFormFieldProps<T extends FieldValues> {
	name: Path<T>
	label: string
	className?: string
	control: Control<T>
	description?: string
	itemClassName?: string
	onValueChange?: (value: number[]) => void
}

export function SliderFormField<T extends FieldValues>({
	name,
	label,
	control,
	className,
	description,
	itemClassName,
	onValueChange,
}: SliderFormFieldProps<T>) {
	return (
		<FormField
			name={name}
			control={control}
			render={({ field }) => (
				<FormItem className={itemClassName}>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<div className="flex items-center gap-2">
							<Slider
								value={field.value}
								className={className}
								onValueChange={onValueChange ?? field.onChange}
							/>

							<span className="text-sm font-semibold">{field.value}%</span>
						</div>
					</FormControl>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
