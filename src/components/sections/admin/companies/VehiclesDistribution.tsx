"use client"

import { CarIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const VehicleTypeLabels: Record<string, string> = {
	CAR: "Automóvil",
	TRUCK: "Camión",
	MOTORCYCLE: "Motocicleta",
	BUS: "Bus",
	TRACTOR: "Tractor",
	TRAILER: "Remolque",
	OTHER: "Otro",
}

type VehicleType = {
	type: string
	count: number
}

type VehiclesDistributionResponse = {
	totalVehicles: number
	vehiclesByType: VehicleType[]
	mainVehicles: number
}

export default function VehiclesDistribution(): React.ReactElement {
	const { data, isLoading } = useQuery<VehiclesDistributionResponse>({
		queryKey: ["companies-vehicles-distribution"],
		queryFn: async () => {
			const response = await fetch("/api/companies/vehicles-distribution")
			if (!response.ok) throw new Error("Error fetching vehicles distribution")
			return response.json()
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	})

	return (
		<Card className="border-none">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 p-3 text-emerald-500">
						<CarIcon />
					</div>
					Vehículos
				</CardTitle>

				<CarIcon className="text-muted-foreground h-4 w-4" />
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="space-y-2">
						<Skeleton className="h-4 w-[250px]" />
						<Skeleton className="h-4 w-[200px]" />
						<Skeleton className="h-4 w-[230px]" />
					</div>
				) : (
					<div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">Total:</span>
							<span className="font-medium">{data?.totalVehicles ?? 0}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">Principales:</span>
							<span className="font-medium">{data?.mainVehicles ?? 0}</span>
						</div>
						<div className="mt-1">
							{data?.vehiclesByType
								.sort((a, b) => b.count - a.count)
								.slice(0, 3)
								.map((vehicle) => (
									<div key={vehicle.type} className="flex items-center justify-between text-sm">
										<span className="truncate">{VehicleTypeLabels[vehicle.type]}</span>
										<span className="font-medium">{vehicle.count}</span>
									</div>
								))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
