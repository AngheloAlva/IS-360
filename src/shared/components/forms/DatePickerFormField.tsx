import { cn } from "@/lib/utils"

import { CalendarIcon } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import {
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription,
} from "@/shared/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Calendar } from "@/shared/components/ui/calendar"
import { Button } from "@/shared/components/ui/button"

import type { Control, FieldValues, Path } from "react-hook-form"

interface DatePickerFormFieldProps<T extends FieldValues> {
	name: Path<T>
	label: string
	optional?: boolean
	className?: string
	control: Control<T>
	showLabel?: boolean
	description?: string
	itemClassName?: string
	disabledCondition?: (date: Date) => boolean
}

export function DatePickerFormField<T extends FieldValues>({
	name,
	label,
	control,
	className,
	description,
	itemClassName,
	optional = false,
	showLabel = true,
	disabledCondition,
}: DatePickerFormFieldProps<T>) {
	return (
		<FormField
			name={name}
			control={control}
			render={({ field }) => (
				<FormItem className={cn("content-start", itemClassName)}>
					{showLabel && (
						<FormLabel className="gap-1">
							{label}
							{optional && <span className="text-muted-foreground"> (opcional)</span>}
						</FormLabel>
					)}
					<Popover>
						<PopoverTrigger asChild>
							<FormControl>
								<Button
									variant={"outline"}
									className={cn(
										"border-input w-full justify-start text-left font-normal",
										!field.value && "text-muted-foreground",
										className
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{field.value ? (
										format(field.value, "PPP", { locale: es })
									) : (
										<span>Seleccionar fecha</span>
									)}
								</Button>
							</FormControl>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar
								locale={es}
								mode="single"
								selected={field.value}
								onSelect={field.onChange}
								defaultMonth={field.value}
								captionLayout={"dropdown"}
								disabled={disabledCondition}
								toYear={new Date().getFullYear() + 1}
								fromYear={new Date().getFullYear() - 1}
							/>
						</PopoverContent>
					</Popover>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
