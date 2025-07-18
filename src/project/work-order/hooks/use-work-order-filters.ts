import { useWorkOrderFiltersStore } from "@/project/work-order/stores/work-order-filters-store"
import { useWorkOrders } from "@/project/work-order/hooks/use-work-order"
import { useDebounce } from "@/shared/hooks/useDebounce"

export const useWorkOrderFilters = () => {
	const store = useWorkOrderFiltersStore()
	const debouncedSearch = useDebounce(store.search, 300)

	const workOrdersQuery = useWorkOrders({
		limit: 15,
		page: store.page,
		order: store.order,
		orderBy: store.orderBy,
		search: debouncedSearch,
		dateRange: store.dateRange,
		companyId: store.companyId,
		typeFilter: store.typeFilter,
		statusFilter: store.statusFilter,
		priorityFilter: store.priorityFilter,
	})

	return {
		filters: {
			statusFilter: store.statusFilter,
			priorityFilter: store.priorityFilter,
			typeFilter: store.typeFilter,
			companyId: store.companyId,
			dateRange: store.dateRange,
			search: store.search,
			page: store.page,
			orderBy: store.orderBy,
			order: store.order,
		},

		actions: {
			setStatusFilter: store.setStatusFilter,
			setPriorityFilter: store.setPriorityFilter,
			setTypeFilter: store.setTypeFilter,
			setCompanyId: store.setCompanyId,
			setDateRange: store.setDateRange,
			setSearch: store.setSearch,
			setPage: store.setPage,
			setOrderBy: store.setOrderBy,
			setOrder: store.setOrder,
			resetFilters: store.resetFilters,
			resetPagination: store.resetPagination,
		},

		// Query
		workOrders: workOrdersQuery,
	}
}
