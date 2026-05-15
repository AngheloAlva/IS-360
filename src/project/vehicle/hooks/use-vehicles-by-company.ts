import { type QueryFunction, useQuery } from "@tanstack/react-query"

import type { VEHICLE_TYPE } from "@/generated/prisma/enums"

type VehicleSortBy = "plate" | "model" | "year" | "brand" | "type" | "isMain" | "createdAt"
type SortOrder = "asc" | "desc"

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
	createdAt: string
}

interface UseVehiclesByCompanyParams {
	page?: number
	pageSize?: number
	limit?: number
	search?: string
	companyId: string
	typeFilter?: VEHICLE_TYPE
	sortBy?: VehicleSortBy
	sortOrder?: SortOrder
}

interface VehiclesByCompanyResponse {
	total: number
	pages: number
	vehicles: Vehicle[]
}

export const useVehiclesByCompany = ({
	page = 1,
	pageSize,
	limit,
	search = "",
	companyId,
	typeFilter,
	sortBy = "createdAt",
	sortOrder = "desc",
}: UseVehiclesByCompanyParams) => {
	const resolvedLimit = limit ?? pageSize ?? 10

	return useQuery<VehiclesByCompanyResponse>({
		queryKey: [
			"vehicles",
			{ page, limit: resolvedLimit, search, companyId, typeFilter, sortBy, sortOrder },
		],
		queryFn: (fn) =>
			fetchVehiclesByCompany({
				...fn,
				queryKey: [
					"vehicles",
					{ page, limit: resolvedLimit, search, companyId, typeFilter, sortBy, sortOrder },
				],
			}),
	})
}

export const fetchVehiclesByCompany: QueryFunction<
	VehiclesByCompanyResponse,
	[
		"vehicles",
		{
			page: number
			limit: number
			search: string
			companyId: string
			typeFilter?: VEHICLE_TYPE
			sortBy: VehicleSortBy
			sortOrder: SortOrder
		},
	]
> = async ({ queryKey }) => {
	const [, { page, limit, search, companyId, typeFilter, sortBy, sortOrder }]: [
		string,
		{
			page: number
			limit: number
			search: string
			companyId: string
			typeFilter?: VEHICLE_TYPE
			sortBy: VehicleSortBy
			sortOrder: SortOrder
		},
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)
	if (typeFilter) searchParams.set("typeFilter", typeFilter)
	searchParams.set("sortBy", sortBy)
	searchParams.set("sortOrder", sortOrder)
	searchParams.set("companyId", companyId)

	const res = await fetch(`/api/companies/vehicles?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching vehicles")

	return res.json()
}
