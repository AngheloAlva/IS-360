import { useQuery } from "@tanstack/react-query"

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
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("page", page.toString())
			searchParams.set("limit", limit.toString())
			if (search) searchParams.set("search", search)
			if (parentId) searchParams.set("parentId", parentId)

			const res = await fetch(`/api/equipments?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching equipments")

			return res.json()
		},
	})
}
