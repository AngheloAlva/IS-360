import { type QueryFunction, useQuery } from "@tanstack/react-query"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"
import type { Attachment } from "@prisma/client"

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
	barcode: string
	children: WorkEquipment[]
	parentId: string | null
	attachments: Attachment[]
	imageUrl?: string | null
	criticality?: string | null
	_count: {
		workOrders: number
		children: number
	}
}

export const fetchEquipments: QueryFunction<
	EquipmentsResponse,
	[
		"equipments",
		{
			page: number
			limit: number
			search: string
			parentId: string | null
			showAll: boolean
			order?: Order
			orderBy?: OrderBy
		},
	]
> = async ({ queryKey }) => {
	const [, { page, limit, search, parentId, showAll, order, orderBy }]: [
		string,
		{
			page: number
			limit: number
			search: string
			parentId: string | null
			showAll: boolean
			order?: Order
			orderBy?: OrderBy
		},
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)
	if (parentId) searchParams.set("parentId", parentId)
	if (showAll) searchParams.set("showAll", showAll.toString())
	if (order) searchParams.set("order", order)
	if (orderBy) searchParams.set("orderBy", orderBy)

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
	showAll?: boolean
	parentId?: string | null
	orderBy: OrderBy
	order: Order
}

export const useEquipments = ({
	order,
	orderBy,
	page = 1,
	limit = 10,
	search = "",
	showAll = true,
	parentId = null,
}: UseEquipmentsParams) => {
	return useQuery<EquipmentsResponse>({
		queryKey: ["equipments", { page, limit, search, parentId, showAll, order, orderBy }],
		queryFn: (fn) =>
			fetchEquipments({
				...fn,
				queryKey: ["equipments", { page, limit, search, parentId, showAll, order, orderBy }],
			}),
	})
}

export const useEquipment = (id: string) => {
	return useQuery<WorkEquipment>({
		queryKey: ["equipments", id],
		queryFn: async () => {
			if (!id) return null

			const res = await fetch(`/api/equipments/${id}`)
			if (!res.ok) throw new Error("Error fetching equipment")

			return res.json()
		},
		enabled: !!id,
	})
}
