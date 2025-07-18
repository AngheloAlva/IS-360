import { useCompanyFiltersStore } from "@/project/company/stores/company-filters-store"
import { useCompanies } from "@/project/company/hooks/use-companies"
import { useDebounce } from "@/shared/hooks/useDebounce"

export const useCompanyFilters = () => {
	const store = useCompanyFiltersStore()
	const debouncedSearch = useDebounce(store.search, 300)

	const companiesQuery = useCompanies({
		limit: 10,
		page: store.page,
		order: store.order,
		orderBy: store.orderBy,
		search: debouncedSearch,
	})

	return {
		filters: {
			page: store.page,
			order: store.order,
			search: store.search,
			orderBy: store.orderBy,
		},

		actions: {
			setPage: store.setPage,
			setOrder: store.setOrder,
			setSearch: store.setSearch,
			setOrderBy: store.setOrderBy,
			resetFilters: store.resetFilters,
			resetPagination: store.resetPagination,
		},

		// Query
		companies: companiesQuery,
	}
}
