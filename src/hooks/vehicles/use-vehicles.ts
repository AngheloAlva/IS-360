import { useQuery } from "@tanstack/react-query"

export interface Vehicle {
	id: string
	plate: string
	model: string
	year: number
	brand: string
	type: string
	color?: string | null
	isMain: boolean
	createdAt: string
	updatedAt: string
}

interface UseVehiclesParams {
	page?: number
	limit?: number
	search?: string
	typeFilter?: string | null
}

interface VehiclesResponse {
	vehicles: Vehicle[]
	total: number
	pages: number
	page: number
	limit: number
}

export const fetchVehicles = async ({
	page = 1,
	limit = 10,
	search = "",
	typeFilter = null,
}: UseVehiclesParams = {}): Promise<VehiclesResponse> => {
	const params = new URLSearchParams()

	params.append("page", page.toString())
	params.append("limit", limit.toString())

	if (search) {
		params.append("search", search)
	}

	if (typeFilter) {
		params.append("typeFilter", typeFilter)
	}

	const response = await fetch(`/api/vehicles?${params.toString()}`)

	if (!response.ok) {
		throw new Error("Error al obtener vehículos")
	}

	return response.json()
}

export const useVehicles = (params: UseVehiclesParams = {}) => {
	return useQuery({
		queryKey: ["vehicles", params],
		queryFn: () => fetchVehicles(params),
		staleTime: 1000 * 60 * 5, // 5 minutos
	})
}
