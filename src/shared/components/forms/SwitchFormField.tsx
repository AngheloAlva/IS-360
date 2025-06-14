"use client"

import {
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription,
} from "@/shared/components/ui/form"
import { Switch } from "@/shared/components/ui/switch"

import type { Control, FieldValues, Path } from "react-hook-form"

interface SwitchFormFieldProps<T extends FieldValues> {
	name: Path<T>
	label: string
	className?: string
	control: Control<T>
	description?: string
	itemClassName?: string
	onCheckedChange?: (checked: boolean) => void
}

export function SwitchFormField<T extends FieldValues>({
	name,
	label,
	control,
	className,
	description,
	itemClassName,
	onCheckedChange,
}: SwitchFormFieldProps<T>) {
	return (
		<FormField
			name={name}
			control={control}
			render={({ field }) => (
				<FormItem className={itemClassName}>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<Switch
							checked={field.value}
							className={className}
							onCheckedChange={onCheckedChange ?? field.onChange}
						/>
					</FormControl>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
