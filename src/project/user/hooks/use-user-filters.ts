import { useUserFiltersStore } from "@/project/user/stores/user-filters-store"
import { useUsers } from "@/project/user/hooks/use-users"
import { useDebounce } from "@/shared/hooks/useDebounce"

export const useUserFilters = () => {
	const store = useUserFiltersStore()
	const debouncedSearch = useDebounce(store.search, 300)

	const usersQuery = useUsers({
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
		users: usersQuery,
	}
}
