import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

export default function ChartSkeleton(): React.ReactElement {
	return (
		<>
			<Skeleton className="h-10 w-full" />

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i} className="col-span-1">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-base font-semibold">
								<Skeleton className="h-4 w-37.5" />
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Skeleton className="h-21.25 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		</>
	)
}
