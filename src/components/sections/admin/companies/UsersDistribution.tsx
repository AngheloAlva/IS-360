"use client"

import { UsersIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type CompanyUsers = {
	name: string
	count: number
}

type UsersDistributionResponse = {
	usersDistribution: CompanyUsers[]
}

export default function UsersDistribution(): React.ReactElement {
	const { data, isLoading } = useQuery<UsersDistributionResponse>({
		queryKey: ["companies-users-distribution"],
		queryFn: async () => {
			const response = await fetch("/api/companies/users-distribution")
			if (!response.ok) throw new Error("Error fetching users distribution")
			return response.json()
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	})

	return (
		<Card className="border-none">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<div className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-500/10 p-3 text-yellow-500">
						<UsersIcon />
					</div>
					Usuarios por Empresa
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
						{data?.usersDistribution
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
