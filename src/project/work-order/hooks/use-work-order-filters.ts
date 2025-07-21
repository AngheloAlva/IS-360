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
		onlyWithRequestClousure: store.onlyWithRequestClousure,
	})

	return {
		filters: {
			page: store.page,
			order: store.order,
			orderBy: store.orderBy,
			search: store.search,
			dateRange: store.dateRange,
			companyId: store.companyId,
			typeFilter: store.typeFilter,
			statusFilter: store.statusFilter,
			priorityFilter: store.priorityFilter,
			onlyWithRequestClousure: store.onlyWithRequestClousure,
		},

		actions: {
			setPage: store.setPage,
			setOrder: store.setOrder,
			setSearch: store.setSearch,
			setOrderBy: store.setOrderBy,
			resetFilters: store.resetFilters,
			setDateRange: store.setDateRange,
			setCompanyId: store.setCompanyId,
			setTypeFilter: store.setTypeFilter,
			setStatusFilter: store.setStatusFilter,
			resetPagination: store.resetPagination,
			setPriorityFilter: store.setPriorityFilter,
			setOnlyWithRequestClousure: store.setOnlyWithRequestClousure,
		},

		// Query
		workOrders: workOrdersQuery,
	}
}
