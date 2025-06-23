"use client"

interface DialogLabelProps {
	icon?: React.ReactNode
	label: string
	value: React.ReactNode
	className?: string
}

export function DialogLabel({ icon, label, value, className }: DialogLabelProps) {
	return (
		<div className={className}>
			<p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
				{icon}
				{label}
			</p>
			<div className="mt-1 font-medium">{value}</div>
		</div>
	)
}
