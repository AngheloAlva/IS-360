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
		companies: companiesQuery,
	}
}