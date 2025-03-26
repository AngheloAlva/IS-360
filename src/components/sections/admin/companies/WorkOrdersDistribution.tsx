"use client"

import { ClipboardListIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type CompanyWorkOrders = {
	name: string
	count: number
}

type WorkOrdersDistributionResponse = {
	workOrdersDistribution: CompanyWorkOrders[]
}

export default function WorkOrdersDistribution(): React.ReactElement {
	const { data, isLoading } = useQuery<WorkOrdersDistributionResponse>({
		queryKey: ["companies-work-orders-distribution"],
		queryFn: async () => {
			const response = await fetch("/api/companies/work-orders-distribution")
			if (!response.ok) throw new Error("Error fetching work orders distribution")
			return response.json()
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	})

	return (
		<Card className="border-none">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 p-3 text-red-500">
						<ClipboardListIcon />
					</div>
					Órdenes de Trabajo por Empresa
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="space-y-2">
						<Skeleton className="h-4 w-[250px]" />
						<Skeleton className="h-4 w-[200px]" />
						<Skeleton className="h-4 w-[230px]" />
					</div>
				) : (
					<div className="space-y-2">
						{data?.workOrdersDistribution
							.sort((a, b) => b.count - a.count)
							.slice(0, 4)
							.map((company) => (
								<div key={company.name} className="flex items-center justify-between text-sm">
									<span className="truncate">{company.name}</span>
									<span className="font-medium">{company.count}</span>
								</div>
							))}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
