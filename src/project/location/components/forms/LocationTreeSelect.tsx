"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/shared/components/ui/command"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { useLocations } from "@/project/location/hooks/use-locations"

interface LocationTreeSelectProps {
	value: string | null
	onChange: (id: string) => void
	name?: string
	placeholder?: string
	disabled?: boolean
}

export function LocationTreeSelect({
	value,
	onChange,
	placeholder = "Seleccionar ubicación...",
	disabled,
}: LocationTreeSelectProps) {
	const [open, setOpen] = useState(false)
	const { data: locations, isLoading } = useLocations()

	const sorted = locations
		? [...locations].sort((a, b) => a.path.localeCompare(b.path))
		: []

	const selected = sorted.find((l) => l.id === value)

	return (
		<Popover open={open} onOpenChange={setOpen} modal>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					disabled={disabled || isLoading}
					className={cn("justify-between overflow-hidden", !value && "text-muted-foreground")}
				>
					{isLoading
						? "Cargando ubicaciones..."
						: selected
							? selected.path
							: placeholder}
					<ChevronsUpDown className="opacity-50" />
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-(--radix-popover-trigger-width) p-0">
				<Command>
					<CommandInput placeholder="Buscar ubicación..." className="h-9" />
					<CommandList>
						<CommandEmpty>
							No hay ubicaciones — crear primero en el panel de ubicaciones
						</CommandEmpty>
						<ScrollArea className="h-72">
							<CommandGroup>
								{sorted.map((location) => (
									<CommandItem
										key={location.id}
										value={location.path}
										onSelect={() => {
											onChange(location.id)
											setOpen(false)
										}}
										className={cn({ "bg-accent": location.id === value })}
									>
										<span className="truncate">{location.path}</span>
										<Check
											className={cn(
												"ml-auto shrink-0",
												location.id === value ? "opacity-100" : "opacity-0"
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
	)
}
