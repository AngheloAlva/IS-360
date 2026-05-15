import { useWorkOrderFiltersStore } from "@/project/work-order/stores/work-order-filters-store"
import { useWorkOrders } from "@/project/work-order/hooks/use-work-order"
import { useDebounce } from "@/shared/hooks/useDebounce"

export const useWorkOrderFilters = () => {
	const store = useWorkOrderFiltersStore()
	const debouncedSearch = useDebounce(store.search, 300)

	const workOrdersQuery = useWorkOrders({
		pageSize: store.pageSize,
		page: store.page,
		sortBy: store.sortBy,
		sortOrder: store.sortOrder,
		search: debouncedSearch,
		dateRange: store.dateRange,
		companyId: store.companyId,
		responsibleId: store.responsibleId,
		typeFilter: store.typeFilter,
		statusFilter: store.statusFilter,
		priorityFilter: store.priorityFilter,
		onlyWithRequestClousure: store.onlyWithRequestClousure,
	})

	return {
		filters: {
			page: store.page,
			pageSize: store.pageSize,
			sortBy: store.sortBy,
			sortOrder: store.sortOrder,
			search: store.search,
			dateRange: store.dateRange,
			companyId: store.companyId,
			responsibleId: store.responsibleId,
			typeFilter: store.typeFilter,
			statusFilter: store.statusFilter,
			priorityFilter: store.priorityFilter,
			onlyWithRequestClousure: store.onlyWithRequestClousure,
		},

		actions: {
			setPage: store.setPage,
			setPageSize: store.setPageSize,
			setSearch: store.setSearch,
			setSortBy: store.setSortBy,
			setSortOrder: store.setSortOrder,
			resetFilters: store.resetFilters,
			setDateRange: store.setDateRange,
			setCompanyId: store.setCompanyId,
			setResponsibleId: store.setResponsibleId,
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
