import { useCompanyFiltersStore } from "@/project/company/stores/company-filters-store"
import { useCompanies } from "@/project/company/hooks/use-companies"
import { useDebounce } from "@/shared/hooks/useDebounce"

export const useCompanyFilters = (isActive?: boolean) => {
	const store = useCompanyFiltersStore()
	const debouncedSearch = useDebounce(store.search, 300)
	const activeStatus = isActive ? store.activeStatus : "active"

	const companiesQuery = useCompanies({
		pageSize: store.pageSize,
		page: store.page,
		order: store.order,
		orderBy: store.orderBy,
		search: debouncedSearch,
		showAll: isActive,
		activeStatus,
	})

	return {
		filters: {
			page: store.page,
			pageSize: store.pageSize,
			order: store.order,
			search: store.search,
			orderBy: store.orderBy,
			activeStatus,
		},

		actions: {
			setPage: store.setPage,
			setPageSize: store.setPageSize,
			setOrder: store.setOrder,
			setSearch: store.setSearch,
			setOrderBy: store.setOrderBy,
			setActiveStatus: store.setActiveStatus,
			resetFilters: store.resetFilters,
			resetPagination: store.resetPagination,
		},

		// Query
		companies: companiesQuery,
	}
}
