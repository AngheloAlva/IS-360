import { useEquipmentFiltersStore } from "@/project/equipment/stores/equipment-filters-store"
import { useEquipments } from "@/project/equipment/hooks/use-equipments"
import { useDebounce } from "@/shared/hooks/useDebounce"

export const useEquipmentFilters = (parentId: string | null) => {
	const store = useEquipmentFiltersStore()
	const debouncedSearch = useDebounce(store.search, 300)

	const equipmentsQuery = useEquipments({
		parentId,
		pageSize: store.pageSize,
		page: store.page,
		order: store.order,
		orderBy: store.orderBy,
		search: debouncedSearch,
		showAll: parentId ? false : store.showAll,
	})

	return {
		filters: {
			parentId,
			page: store.page,
			pageSize: store.pageSize,
			search: store.search,
			orderBy: store.orderBy,
			order: store.order,
			showAll: parentId ? false : store.showAll,
		},

		actions: {
			setPage: store.setPage,
			setPageSize: store.setPageSize,
			setSearch: store.setSearch,
			setOrderBy: store.setOrderBy,
			setOrder: store.setOrder,
			setShowAll: store.setShowAll,
			setParentId: store.setParentId,
			resetFilters: store.resetFilters,
			resetPagination: store.resetPagination,
		},

		// Query
		equipments: equipmentsQuery,
	}
}
