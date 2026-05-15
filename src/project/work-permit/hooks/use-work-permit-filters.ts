import { useWorkPermitFiltersStore } from "@/project/work-permit/stores/work-permit-filters-store"
import { useWorkPermits } from "@/project/work-permit/hooks/use-work-permit"
import { useDebounce } from "@/shared/hooks/useDebounce"

export const useWorkPermitFilters = () => {
	const store = useWorkPermitFiltersStore()
	const debouncedSearch = useDebounce(store.search, 300)

	const workPermitsQuery = useWorkPermits({
		limit: store.pageSize,
		page: store.page,
		sortBy: store.sortBy,
		sortOrder: store.sortOrder,
		search: debouncedSearch,
		dateRange: store.dateRange,
		companyId: store.companyId,
		approvedBy: store.approvedBy,
		typeFilter: store.typeFilter,
		statusFilter: store.statusFilter,
		hasLockoutPermit: store.hasLockoutPermit,
	})

	return {
		filters: {
			statusFilter: store.statusFilter,
			companyId: store.companyId,
			approvedBy: store.approvedBy,
			typeFilter: store.typeFilter,
			dateRange: store.dateRange,
			hasLockoutPermit: store.hasLockoutPermit,
			search: store.search,
			page: store.page,
			pageSize: store.pageSize,
			sortBy: store.sortBy,
			sortOrder: store.sortOrder,
		},
		actions: {
			setStatusFilter: store.setStatusFilter,
			setCompanyId: store.setCompanyId,
			setApprovedBy: store.setApprovedBy,
			setTypeFilter: store.setTypeFilter,
			setDateRange: store.setDateRange,
			setHasLockoutPermit: store.setHasLockoutPermit,
			setSearch: store.setSearch,
			setPage: store.setPage,
			setPageSize: store.setPageSize,
			setSortBy: store.setSortBy,
			setSortOrder: store.setSortOrder,
			resetFilters: store.resetFilters,
			resetPagination: store.resetPagination,
		},
		workPermits: workPermitsQuery,
	}
}
