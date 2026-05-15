"use client"

import { BookOpenCheckIcon, ChevronRightIcon } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

import type { TutorialLink } from "@/project/tutorials/types"
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu"

interface TutorialsDropdownProps {
	tutorials: TutorialLink[]
	className?: string
	triggerClassName?: string
	targetId?: string
}

export default function TutorialsDropdown({
	tutorials,
	className,
	triggerClassName,
	targetId,
}: TutorialsDropdownProps): React.ReactElement {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				data-tutorial-id={targetId}
				className={cn(
					"flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-white px-3 text-sm font-semibold text-orange-500 transition-all hover:scale-105 dark:text-orange-700",
					triggerClassName
				)}
			>
				<BookOpenCheckIcon className="size-4" />
				Tutorial
			</DropdownMenuTrigger>

			<DropdownMenuContent className={cn("w-full", className)} align="end">
				<DropdownMenuLabel>Tutoriales interactivos</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					{tutorials.map((tutorial, index) => (
						<DropdownMenuItem key={tutorial.slug} asChild className="cursor-pointer">
							<Link href={tutorial.href}>
								<div className="flex min-w-0 flex-col">
									<span className="truncate font-medium">
										{index + 1}. {tutorial.title}
									</span>
									<span className="text-muted-foreground line-clamp-1 text-xs">
										{tutorial.description}
									</span>
								</div>
								<ChevronRightIcon className="ml-auto size-4" />
							</Link>
						</DropdownMenuItem>
					))}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
