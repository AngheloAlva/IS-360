import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface MetadataProps {
	title: string
	value: number
	className?: string
	description: string
	isLoading?: boolean
	icon: React.ReactNode
}

export function Metadata({
	title,
	value,
	description,
	className,
	isLoading = false,
	icon,
}: MetadataProps) {
	return (
		<Card className="overflow-hidden border-none pt-0">
			<div className={cn("bg-gradient-to-br from-blue-700 to-indigo-700 p-1.5", className)} />

			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-base font-medium">{title}</CardTitle>
				{icon}
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<Skeleton className="h-8 w-14 bg-white/80" />
				) : (
					<div className="text-2xl font-bold">{value}</div>
				)}
				<p className="text-muted-foreground text-xs">{description}</p>
			</CardContent>
		</Card>
	)
}
