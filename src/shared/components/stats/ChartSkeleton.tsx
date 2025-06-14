import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

export default function ChartSkeleton(): React.ReactElement {
	return (
		<>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i} className="col-span-1">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-base font-medium">
								<Skeleton className="h-4 w-[150px]" />
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Skeleton className="h-[85px] w-full" />
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<Card key={i} className="col-span-1">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-base font-medium">
								<Skeleton className="h-4 w-[250px]" />
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Skeleton className="h-[300px] w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		</>
	)
}
