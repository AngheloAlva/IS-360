import { type QueryFunction, useQuery } from "@tanstack/react-query"

import type { VEHICLE_TYPE } from "@prisma/client"

export interface Vehicle {
	id: string
	year: number
	model: string
	plate: string
	brand: string
	type: VEHICLE_TYPE
	isMain: boolean
	companyId: string
	company: {
		name: string
	}
}

export interface UseVehiclesParams {
	page?: number
	limit?: number
	search?: string
	typeFilter?: VEHICLE_TYPE
}

export interface VehiclesResponse {
	vehicles: Vehicle[]
	total: number
	pages: number
}

export const fetchVehicles: QueryFunction<
	VehiclesResponse,
	readonly ["vehicles", { page: number; limit: number; search: string; typeFilter?: VEHICLE_TYPE }]
> = async ({ queryKey }) => {
	const [, { page, limit, search, typeFilter }] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)
	if (typeFilter) searchParams.set("typeFilter", typeFilter)

	const res = await fetch(`/api/companies/vehicles?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching vehicles")

	return res.json()
}

export const useVehicles = ({
	page = 1,
	limit = 10,
	search = "",
	typeFilter,
}: UseVehiclesParams = {}) => {
	const queryKey = ["vehicles", { page, limit, search, typeFilter }] as const

	return useQuery({
		queryKey,
		queryFn: fetchVehicles,
	})
}
