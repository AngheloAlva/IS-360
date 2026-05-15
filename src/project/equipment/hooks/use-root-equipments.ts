import type { Order } from "@/shared/components/OrderByButton"

import { useEquipments, type EquipmentSortBy } from "@/project/equipment/hooks/use-equipments"

interface UseRootEquipmentsParams {
	search?: string
	orderBy: EquipmentSortBy
	order: Order
	enabled?: boolean
}

export const useRootEquipments = ({ search, orderBy, order, enabled }: UseRootEquipmentsParams) => {
	return useEquipments({
		parentId: null,
		limit: 1000,
		showAll: false,
		search,
		orderBy,
		order,
		enabled,
	})
}
