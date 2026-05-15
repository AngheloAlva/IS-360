import { useMaintenancePlanFiltersStore } from "@/project/maintenance-plan/stores/maintenance-plan-filters-store"
import { useMaintenancePlans } from "@/project/maintenance-plan/hooks/use-maintenance-plans"
import { useDebounce } from "@/shared/hooks/useDebounce"

export const useMaintenancePlanFilters = () => {
	const store = useMaintenancePlanFiltersStore()
	const debouncedSearch = useDebounce(store.search, 300)

	const maintenancePlansQuery = useMaintenancePlans({
		limit: 10,
		page: store.page,
		order: store.order,
		orderBy: store.orderBy,
		search: debouncedSearch,
	})

	return {
		filters: {
			search: store.search,
			page: store.page,
			orderBy: store.orderBy,
			order: store.order,
		},

		actions: {
			setSearch: store.setSearch,
			setPage: store.setPage,
			setOrderBy: store.setOrderBy,
			setOrder: store.setOrder,
			resetFilters: store.resetFilters,
			resetPagination: store.resetPagination,
		},

		// Query
		maintenancePlans: maintenancePlansQuery,
	}
}