"use client"

import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import {
	FormItem,
	FormLabel,
	FormField,
	FormControl,
	FormMessage,
	FormDescription,
} from "@/components/ui/form"
import {
	Command,
	CommandList,
	CommandItem,
	CommandEmpty,
	CommandGroup,
	CommandInput,
} from "@/components/ui/command"

import type { Control, FieldValues, Path } from "react-hook-form"

interface SelectWithSearchFormFieldProps<T extends FieldValues> {
	name: Path<T>
	label?: string
	className?: string
	control: Control<T>
	placeholder?: string
	description?: string
	itemClassName?: string
	options: { value: string; label: string }[]
	onChange?: (value: string) => void
}

export function SelectWithSearchFormField<T extends FieldValues>({
	name,
	label,
	options,
	control,
	onChange,
	className,
	placeholder,
	description,
	itemClassName,
}: SelectWithSearchFormFieldProps<T>) {
	return (
		<FormField
			name={name}
			control={control}
			render={({ field }) => (
				<FormItem className={itemClassName}>
					<FormLabel>{label}</FormLabel>
					<Popover modal>
						<PopoverTrigger asChild>
							<FormControl>
								<Button
									variant="outline"
									role="combobox"
									className={cn(
										"justify-between overflow-hidden",
										!field.value && "text-muted-foreground",
										className
									)}
								>
									{field.value
										? options?.find((equipment) => equipment.value === field.value)?.label
										: placeholder || label}
									<ChevronsUpDown className="opacity-50" />
								</Button>
							</FormControl>
						</PopoverTrigger>
						<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
							<Command>
								<CommandInput placeholder="Buscar equipo..." className="h-9" />

								<CommandList>
									<CommandEmpty>No hay resultados.</CommandEmpty>
									<CommandGroup>
										{options?.map((option) => (
											<CommandItem
												value={option.label}
												key={option.value}
												onSelect={() => {
													field.onChange(option.value)
													if (onChange) onChange(option.value)
												}}
												className={cn({
													"bg-primary": option.value === field.value,
												})}
											>
												{option.label}

												<Check
													className={cn(
														"ml-auto text-white",
														option.value === field.value ? "opacity-100" : "opacity-0"
													)}
												/>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
