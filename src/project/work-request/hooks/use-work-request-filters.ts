import { useWorkRequestFiltersStore } from "@/project/work-request/stores/work-request-filters-store"
import { useWorkRequests } from "@/project/work-request/hooks/use-work-request"
import { useDebounce } from "@/shared/hooks/useDebounce"

export const useWorkRequestFilters = () => {
	const store = useWorkRequestFiltersStore()
	const debouncedSearch = useDebounce(store.search, 300)

	const workRequestsQuery = useWorkRequests({
		limit: 10,
		page: store.page,
		search: debouncedSearch,
		status: store.status || "all",
		isUrgent: store.isUrgent,
	})

	return {
		filters: {
			status: store.status,
			isUrgent: store.isUrgent,
			search: store.search,
			page: store.page,
		},

		actions: {
			setStatus: store.setStatus,
			setIsUrgent: store.setIsUrgent,
			setSearch: store.setSearch,
			setPage: store.setPage,
			resetFilters: store.resetFilters,
			resetPagination: store.resetPagination,
		},

		// Query
		workRequests: workRequestsQuery,
	}
}