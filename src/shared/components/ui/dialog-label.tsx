"use client"

import { Skeleton } from "./skeleton"

interface DialogLabelProps {
	label: string
	className?: string
	isLoading?: boolean
	icon?: React.ReactNode
	value: React.ReactNode
}

export function DialogLabel({
	icon,
	label,
	value,
	className,
	isLoading = false,
}: DialogLabelProps) {
	return (
		<div className={className}>
			<p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
				{icon}
				{label}
			</p>
			<div className="mt-1 font-medium">
				{isLoading ? <Skeleton className="h-6 w-full" /> : value}
			</div>
		</div>
	)
}
