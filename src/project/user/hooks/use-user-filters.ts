import { useUserFiltersStore } from "@/project/user/stores/user-filters-store"
import { useUsers } from "@/project/user/hooks/use-users"
import { useDebounce } from "@/shared/hooks/useDebounce"

export const useUserFilters = () => {
	const store = useUserFiltersStore()
	const debouncedSearch = useDebounce(store.search, 300)

	const usersQuery = useUsers({
		pageSize: store.pageSize,
		page: store.page,
		order: store.order,
		orderBy: store.orderBy,
		search: debouncedSearch,
		area: store.area,
	})

	return {
		filters: {
			search: store.search,
			area: store.area,
			page: store.page,
			pageSize: store.pageSize,
			orderBy: store.orderBy,
			order: store.order,
		},

		actions: {
			setSearch: store.setSearch,
			setArea: store.setArea,
			setPage: store.setPage,
			setPageSize: store.setPageSize,
			setOrderBy: store.setOrderBy,
			setOrder: store.setOrder,
			resetFilters: store.resetFilters,
			resetPagination: store.resetPagination,
		},

		// Query
		users: usersQuery,
	}
}
