"use client"

import type { ReactNode } from "react"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent } from "../ui/card"

export interface DataGridActiveFilter {
	key: string
	label: string
	onClear: () => void
}

export function DataGridToolbar({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) {
	return (
		<Card className={className}>
			<CardContent className="flex flex-col">{children}</CardContent>
		</Card>
	)
}

export function DataGridActiveFilters({
	filters,
	className,
}: {
	filters: DataGridActiveFilter[]
	className?: string
}) {
	if (filters.length === 0) {
		return null
	}

	return (
		<div className={cn("mt-3 flex flex-wrap items-center gap-1.5", className)}>
			{filters.map((filterItem) => (
				<button type="button" key={filterItem.key} onClick={filterItem.onClear} className="group">
					<Badge
						variant="secondary"
						className="hover:bg-secondary/80 flex cursor-pointer items-center gap-1"
					>
						<span>{filterItem.label}</span>
						<XIcon className="text-muted-foreground hidden size-3 group-hover:block" />
					</Badge>
				</button>
			))}
		</div>
	)
}
