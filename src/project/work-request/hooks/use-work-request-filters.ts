import { useWorkRequestFiltersStore } from "@/project/work-request/stores/work-request-filters-store"
import { useWorkRequests } from "@/project/work-request/hooks/use-work-request"
import { useDebounce } from "@/shared/hooks/useDebounce"

export const useWorkRequestFilters = () => {
	const store = useWorkRequestFiltersStore()
	const debouncedSearch = useDebounce(store.search, 300)

	const workRequestsQuery = useWorkRequests({
		pageSize: store.pageSize,
		page: store.page,
		search: debouncedSearch,
		status: store.status || "all",
		isUrgent: store.isUrgent,
		sortBy: store.sortBy,
		sortOrder: store.sortOrder,
		include: "table",
	})

	return {
		filters: {
			status: store.status,
			isUrgent: store.isUrgent,
			search: store.search,
			page: store.page,
			pageSize: store.pageSize,
			sortBy: store.sortBy,
			sortOrder: store.sortOrder,
		},

		actions: {
			setStatus: store.setStatus,
			setIsUrgent: store.setIsUrgent,
			setSearch: store.setSearch,
			setPage: store.setPage,
			setPageSize: store.setPageSize,
			setSortBy: store.setSortBy,
			setSortOrder: store.setSortOrder,
			resetFilters: store.resetFilters,
			resetPagination: store.resetPagination,
		},

		// Query
		workRequests: workRequestsQuery,
	}
}
