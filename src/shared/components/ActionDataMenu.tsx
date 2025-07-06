import { PanelTopOpenIcon } from "lucide-react"

import { Button } from "./ui/button"
import {
	DropdownMenu,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "./ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface ActionDataMenu {
	children: React.ReactElement
	className?: string
}

export default function ActionDataMenu({
	children,
	className,
}: ActionDataMenu): React.ReactElement {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className={cn("h-8 w-8 p-0", className)}>
					<span className="sr-only">Abrir menú acciones</span>
					<PanelTopOpenIcon className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Acciones</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{children}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
