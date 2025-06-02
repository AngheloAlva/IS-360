"use client"

import { Sketch } from "@uiw/react-color"

import { cn } from "@/lib/utils"

import { FormItem, FormLabel, FormField, FormControl, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import type { Control, FieldValues, Path } from "react-hook-form"

interface ColorPickerFormFieldProps<T extends FieldValues> {
	name: Path<T>
	label: string
	optional?: boolean
	className?: string
	control: Control<T>
	itemClassName?: string
}

export function ColorPickerFormField<T extends FieldValues>({
	name,
	label,
	control,
	optional,
	className,
	itemClassName,
}: ColorPickerFormFieldProps<T>) {
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
						<Popover>
							<PopoverTrigger
								className={cn(
									"border-input w-full rounded-md border px-3 py-1.5 text-start text-sm shadow-xs",
									className
								)}
							>
								{field.value || "Color"}
							</PopoverTrigger>
							<PopoverContent className="w-fit p-2">
								<Sketch
									color={field.value || "#000000"}
									onChange={(color) => {
										field.onChange(color.hex)
									}}
								/>
							</PopoverContent>
						</Popover>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
