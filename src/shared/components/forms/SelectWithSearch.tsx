"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Button } from "@/shared/components/ui/button"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import {
	Command,
	CommandList,
	CommandItem,
	CommandEmpty,
	CommandGroup,
	CommandInput,
} from "@/shared/components/ui/command"

interface SelectWithSearchProps {
	value: string
	label?: string
	className?: string
	disabled?: boolean
	placeholder?: string
	description?: string
	onChange: (value: string) => void
	options: { value: string; label: string }[]
}

export function SelectWithSearch({
	value,
	label,
	options,
	onChange,
	disabled,
	className,
	placeholder,
	description,
}: SelectWithSearchProps) {
	const [open, setOpen] = useState(false)

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			{label && (
				<label className="text-sm font-medium leading-none">
					{label}
				</label>
			)}
			<Popover open={open} onOpenChange={setOpen} modal>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						disabled={disabled}
						className={cn(
							"justify-between overflow-hidden",
							!value && "text-muted-foreground"
						)}
					>
						{value
							? options.find((o) => o.value === value)?.label
							: placeholder || label || "Seleccionar..."}
						<ChevronsUpDown className="opacity-50" />
					</Button>
				</PopoverTrigger>

				<PopoverContent className="w-(--radix-popover-trigger-width) p-0">
					<Command>
						<CommandInput placeholder="Buscar..." className="h-9" />
						<CommandList>
							<CommandEmpty>No hay resultados.</CommandEmpty>
							<ScrollArea className="h-72">
								<CommandGroup>
									{options.map((option) => (
										<CommandItem
											value={option.label}
											key={option.value}
											onSelect={() => {
												onChange(option.value)
												setOpen(false)
											}}
											className={cn({
												"bg-accent": option.value === value,
											})}
										>
											{option.label}
											<Check
												className={cn(
													"ml-auto",
													option.value === value ? "opacity-100" : "opacity-0"
												)}
											/>
										</CommandItem>
									))}
								</CommandGroup>
							</ScrollArea>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{description && (
				<p className="text-muted-foreground text-xs">{description}</p>
			)}
		</div>
	)
}
