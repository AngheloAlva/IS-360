"use client"

import { LayoutGridIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AreasLabels } from "@/lib/consts/areas"

type AreaDistributionResponse = {
	areaDistribution: Array<{
		area: string
		count: number
	}>
}

export default function AreaDistribution(): React.ReactElement {
	const { data, isLoading } = useQuery<AreaDistributionResponse>({
		queryKey: ["users-area-distribution"],
		queryFn: async () => {
			const response = await fetch("/api/users/area-distribution")
			if (!response.ok) throw new Error("Error fetching area distribution")
			return response.json()
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	})

	console.log(data)

	return (
		<Card className="border-none">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500/10 p-3 text-orange-500">
						<LayoutGridIcon />
					</div>
					Distribución por Áreas
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="space-y-2">
						<Skeleton className="h-4 w-[100px]" />
						<Skeleton className="h-4 w-[90px]" />
						<Skeleton className="h-4 w-[80px]" />
					</div>
				) : (
					<div className="space-y-2">
						{data?.areaDistribution.map((area) => (
							<div key={area.area} className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									{AreasLabels[area.area as keyof typeof AreasLabels]}
								</span>
								<span className="font-medium">{area.count}</span>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
