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
} from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"

import type { Control, FieldValues, Path } from "react-hook-form"

interface DatePickerFormFieldProps<T extends FieldValues> {
	name: Path<T>
	label: string
	optional?: boolean
	className?: string
	control: Control<T>
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
	disabledCondition,
}: DatePickerFormFieldProps<T>) {
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
								initialFocus
								mode="single"
								selected={field.value}
								onSelect={field.onChange}
								disabled={disabledCondition}
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
