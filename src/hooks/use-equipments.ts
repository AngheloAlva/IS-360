import { QueryFunction, useQuery } from "@tanstack/react-query"

export async function fetchAllEquipments(parentId: string | null = null) {
	const searchParams = new URLSearchParams()
	searchParams.set("page", "1")
	searchParams.set("limit", "1000")
	if (parentId) searchParams.set("parentId", parentId)

	const res = await fetch(`/api/equipments?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching equipments")

	const data = await res.json()
	return data.equipments
}

export interface WorkEquipment {
	id: string
	name: string
	location: string
	createdAt: string
	updatedAt: string
	description: string
	isOperational: boolean
	type: string | null
	tag: string
	children: WorkEquipment[]
	_count: {
		workOrders: number
		children: number
	}
}

export const fetchEquipments: QueryFunction<
	EquipmentsResponse,
	["equipments", { page: number; limit: number; search: string; parentId: string | null }]
> = async ({ queryKey }) => {
	const [, { page, limit, search, parentId }]: [
		string,
		{ page: number; limit: number; search: string; parentId: string | null },
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)
	if (parentId) searchParams.set("parentId", parentId)

	const res = await fetch(`/api/equipments?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching equipments")

	return await res.json()
}

interface EquipmentsResponse {
	equipments: WorkEquipment[]
	total: number
	pages: number
}

interface UseEquipmentsParams {
	page?: number
	limit?: number
	search?: string
	parentId?: string | null
}

export const useEquipments = ({
	page = 1,
	limit = 10,
	search = "",
	parentId = null,
}: UseEquipmentsParams) => {
	return useQuery<EquipmentsResponse>({
		queryKey: ["equipments", { page, limit, search, parentId }],
		queryFn: (fn) =>
			fetchEquipments({ ...fn, queryKey: ["equipments", { page, limit, search, parentId }] }),
	})
}

export const useEquipment = (id: string) => {
	return useQuery({
		queryKey: ["equipment", id],
		queryFn: async () => {
			if (!id) return null

			const res = await fetch(`/api/equipments/${id}`)
			if (!res.ok) throw new Error("Error fetching equipment")

			return res.json()
		},
		enabled: !!id,
	})
}
