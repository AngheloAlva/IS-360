import { useQuery } from "@tanstack/react-query"

import type { Order } from "@/shared/components/OrderByButton"

import { fetchEquipments, type EquipmentSortBy, type EquipmentsResponse } from "@/project/equipment/hooks/use-equipments"

interface UseChildEquipmentsParams {
	parentId: string | null
	orderBy: EquipmentSortBy
	order: Order
}

export const useChildEquipments = ({ parentId, orderBy, order }: UseChildEquipmentsParams) => {
	return useQuery<EquipmentsResponse>({
		queryKey: ["equipments", { page: 1, limit: 1000, search: "", parentId, showAll: false, order, orderBy }],
		queryFn: () => fetchEquipments({ page: 1, limit: 1000, search: "", parentId, showAll: false, order, orderBy }),
		enabled: !!parentId,
		staleTime: 60000,
	})
}
