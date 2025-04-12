import { cn } from "@/lib/utils"

import { CalendarIcon } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import { FormItem, FormLabel, FormField, FormControl, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"

import type { Control, FieldValues, Path } from "react-hook-form"

interface DatePickerFormFieldProps<T extends FieldValues> {
	name: Path<T>
	label: string
	className?: string
	control: Control<T>
	itemClassName?: string
}

export function DatePickerFormField<T extends FieldValues>({
	name,
	label,
	control,
	className,
	itemClassName,
}: DatePickerFormFieldProps<T>) {
	return (
		<FormField
			name={name}
			control={control}
			render={({ field }) => (
				<FormItem className={itemClassName}>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<Popover>
							<PopoverTrigger asChild>
								<FormControl>
									<Button
										variant={"outline"}
										className={cn(
											"border-input w-full justify-start bg-white text-left font-normal",
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
