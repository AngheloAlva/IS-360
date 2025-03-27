"use client"

import { ContactIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type RoleDistributionResponse = {
	roleDistribution: Array<{
		role: string
		count: number
	}>
	supervisorsCount: number
}

export default function RoleDistribution(): React.ReactElement {
	const { data, isLoading } = useQuery<RoleDistributionResponse>({
		queryKey: ["users-role-distribution"],
		queryFn: async () => {
			const response = await fetch("/api/users/role-distribution")
			if (!response.ok) throw new Error("Error fetching role distribution")
			return response.json()
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	})

	return (
		<Card className="border-none">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 p-3 text-red-500">
						<ContactIcon />
					</div>
					Distribución por Roles
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
						{data?.roleDistribution.map((role) => (
							<div key={role.role} className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">{role.role}</span>
								<span className="font-medium">{role.count}</span>
							</div>
						))}
						<div className="flex items-center justify-between border-t pt-2 text-sm">
							<span className="text-muted-foreground">Supervisores</span>
							<span className="font-medium">{data?.supervisorsCount ?? 0}</span>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
