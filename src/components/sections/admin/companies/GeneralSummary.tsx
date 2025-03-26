"use client"

import { BuildingIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type GeneralSummaryResponse = {
	totalCompanies: number
}

export default function GeneralSummary(): React.ReactElement {
	const { data, isLoading } = useQuery<GeneralSummaryResponse>({
		queryKey: ["companies-general-summary"],
		queryFn: async () => {
			const response = await fetch("/api/companies/general-summary")
			if (!response.ok) throw new Error("Error fetching general summary")
			return response.json()
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	})

	return (
		<Card className="border-none">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-500/10 p-3 text-purple-500">
						<BuildingIcon />
					</div>
					Total de Empresas
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<Skeleton className="h-9 w-[60px]" />
				) : (
					<div className="text-2xl font-bold">{data?.totalCompanies ?? 0}</div>
				)}
			</CardContent>
		</Card>
	)
}
