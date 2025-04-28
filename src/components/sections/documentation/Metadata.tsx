import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface MetadataProps {
	title: string
	value: number
	className?: string
	description: string
	isLoading?: boolean
}

export function Metadata({ title, value, description, className, isLoading = false }: MetadataProps) {
	return (
		<Card className={className}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 bg-white/80 w-14" /> : value}</div>
				<p className="text-muted-foreground text-xs">{description}</p>
			</CardContent>
		</Card>
	)
}
