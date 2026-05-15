import { useQuery } from "@tanstack/react-query"

import type { Order } from "@/shared/components/OrderByButton"
import type { Attachment } from "@/generated/prisma/client"

export type EquipmentSortBy =
	| "name"
	| "tag"
	| "location"
	| "type"
	| "isOperational"
	| "createdAt"
	| "updatedAt"

export async function fetchAllEquipments(parentId: string | null = null, showAll = false) {
	const searchParams = new URLSearchParams()
	searchParams.set("page", "1")
	searchParams.set("limit", "1000")
	searchParams.set("order", "desc")
	searchParams.set("orderBy", "name")
	if (showAll) searchParams.set("showAll", "true")
	else if (parentId) searchParams.set("parentId", parentId)

	const res = await fetch(`/api/equipments?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching equipments")

	const data = await res.json()
	return data.equipments
}

export interface WorkEquipment {
	id: string
	name: string
	locationId: string
	location: { id: string; name: string; path: string }
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

export interface FetchEquipmentsParams {
	page: number
	limit: number
	search: string
	parentId: string | null
	showAll: boolean
	order?: Order
	orderBy?: EquipmentSortBy
	locationId?: string
	rootOnly?: boolean
}

export const fetchEquipments = async (params: FetchEquipmentsParams): Promise<EquipmentsResponse> => {
	const { page, limit, search, parentId, showAll, order, orderBy, locationId, rootOnly } = params

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)
	if (parentId) searchParams.set("parentId", parentId)
	if (showAll) searchParams.set("showAll", showAll.toString())
	if (order) searchParams.set("order", order)
	if (orderBy) searchParams.set("orderBy", orderBy)
	if (locationId) searchParams.set("locationId", locationId)
	if (rootOnly) searchParams.set("rootOnly", "true")

	const res = await fetch(`/api/equipments?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching equipments")

	return await res.json()
}

export interface EquipmentsResponse {
	equipments: WorkEquipment[]
	total: number
	pages: number
}

interface UseEquipmentsParams {
	page?: number
	pageSize?: number
	limit?: number
	search?: string
	showAll?: boolean
	parentId?: string | null
	locationId?: string
	rootOnly?: boolean
	orderBy: EquipmentSortBy
	order: Order
	enabled?: boolean
}

export const useEquipments = ({
	order,
	orderBy,
	pageSize,
	page = 1,
	limit,
	search = "",
	showAll = true,
	parentId = null,
	locationId,
	rootOnly,
	enabled,
}: UseEquipmentsParams) => {
	const resolvedLimit = limit ?? pageSize ?? 10

	return useQuery<EquipmentsResponse>({
		queryKey: [
			"equipments",
			{ page, limit: resolvedLimit, search, parentId, showAll, order, orderBy, locationId, rootOnly },
		],
		queryFn: () =>
			fetchEquipments({
				page,
				limit: resolvedLimit,
				search,
				parentId,
				showAll,
				order,
				orderBy,
				locationId,
				rootOnly,
			}),
		enabled,
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
