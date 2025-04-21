import { useQuery } from "@tanstack/react-query"

import type { VEHICLE_TYPE } from "@prisma/client"

export interface Vehicle {
	id: string
	year: number
	model: string
	plate: string
	brand: string
	type: VEHICLE_TYPE
	isMain: boolean
	company: {
		name: string
	}
}

interface UseVehiclesParams {
	page?: number
	limit?: number
	search?: string
}

interface VehiclesResponse {
	vehicles: Vehicle[]
	total: number
	pages: number
}

export const useVehicles = ({ page = 1, limit = 10, search = "" }: UseVehiclesParams = {}) => {
	return useQuery<VehiclesResponse>({
		queryKey: ["vehicles", { page, limit, search }],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("page", page.toString())
			searchParams.set("limit", limit.toString())
			if (search) searchParams.set("search", search)

			const res = await fetch(`/api/companies/vehicles?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching vehicles")

			return res.json()
		},
	})
}
