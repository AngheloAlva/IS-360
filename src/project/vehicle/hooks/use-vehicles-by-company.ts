import { type QueryFunction, useQuery } from "@tanstack/react-query"

import type { VEHICLE_TYPE } from "@prisma/client"

export interface Vehicle {
	id: string
	year?: number
	model?: string
	plate?: string
	brand?: string
	color?: string
	isMain?: boolean
	type?: VEHICLE_TYPE
	companyId: string
}

interface UseVehiclesByCompanyParams {
	page?: number
	limit?: number
	search?: string
	companyId: string
}

interface VehiclesByCompanyResponse {
	total: number
	pages: number
	vehicles: Vehicle[]
}

export const useVehiclesByCompany = ({
	page = 1,
	limit = 10,
	search = "",
	companyId,
}: UseVehiclesByCompanyParams) => {
	return useQuery<VehiclesByCompanyResponse>({
		queryKey: ["vehicles", { page, limit, search, companyId }],
		queryFn: (fn) =>
			fetchVehiclesByCompany({ ...fn, queryKey: ["vehicles", { page, limit, search, companyId }] }),
	})
}

export const fetchVehiclesByCompany: QueryFunction<
	VehiclesByCompanyResponse,
	["vehicles", { page: number; limit: number; search: string; companyId: string }]
> = async ({ queryKey }) => {
	const [, { page, limit, search, companyId }]: [
		string,
		{ page: number; limit: number; search: string; companyId: string },
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)
	searchParams.set("companyId", companyId)

	const res = await fetch(`/api/companies/vehicles?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching vehicles")

	return res.json()
}
