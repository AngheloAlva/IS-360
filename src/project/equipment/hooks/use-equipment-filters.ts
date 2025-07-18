import { useEquipmentFiltersStore } from "@/project/equipment/stores/equipment-filters-store"
import { useEquipments } from "@/project/equipment/hooks/use-equipments"
import { useDebounce } from "@/shared/hooks/useDebounce"

export const useEquipmentFilters = () => {
	const store = useEquipmentFiltersStore()
	const debouncedSearch = useDebounce(store.search, 300)

	const equipmentsQuery = useEquipments({
		limit: 10,
		page: store.page,
		search: debouncedSearch,
		showAll: store.showAll,
		parentId: store.parentId,
	})

	return {
		filters: {
			parentId: store.parentId,
			showAll: store.showAll,
			search: store.search,
			page: store.page,
		},

		actions: {
			setParentId: store.setParentId,
			setShowAll: store.setShowAll,
			setSearch: store.setSearch,
			setPage: store.setPage,
			resetFilters: store.resetFilters,
			resetPagination: store.resetPagination,
		},

		// Query
		equipments: equipmentsQuery,
	}
}