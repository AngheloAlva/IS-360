"use client"

import { ALargeSmallIcon, Type } from "lucide-react"

import { useFontSize } from "@/shared/components/providers/FontSizeProvider"
import { cn } from "@/lib/utils"

import { Button } from "@/shared/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu"

export function FontSizeSelector() {
	const { fontSize, setFontSize } = useFontSize()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon" className="size-8">
					<Type />
					<span className="sr-only">Cambiar Tamaño de fuente</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Tamaño de fuente</DropdownMenuLabel>
				<DropdownMenuSeparator />

				<DropdownMenuItem
					onClick={() => setFontSize("small")}
					className={cn("flex items-center justify-between", {
						"bg-accent": fontSize === "small",
					})}
				>
					Pequeño
					<ALargeSmallIcon className="size-4" />
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setFontSize("medium")}
					className={cn("flex items-center justify-between", {
						"bg-accent": fontSize === "medium",
					})}
				>
					Normal
					<ALargeSmallIcon className="size-5" />
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setFontSize("large")}
					className={cn("flex items-center justify-between", {
						"bg-accent": fontSize === "large",
					})}
				>
					Grande
					<ALargeSmallIcon className="size-6" />
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setFontSize("x-large")}
					className={cn("flex items-center justify-between", {
						"bg-accent": fontSize === "x-large",
					})}
				>
					Gigante
					<ALargeSmallIcon className="size-7" />
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
