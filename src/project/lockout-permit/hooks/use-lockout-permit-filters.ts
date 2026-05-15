"use client"

import { useLockoutPermitFiltersStore } from "../stores/lockout-permit-filters-store"
import { useLockoutPermits } from "./use-lockout-permit"

export function useLockoutPermitFilters() {
	const {
		statusFilter,
		companyId,
		approvedBy,
		typeFilter,
		dateRange,
		search,
		page,
		orderBy,
		order,
		setStatusFilter,
		setCompanyId,
		setApprovedBy,
		setTypeFilter,
		setDateRange,
		setSearch,
		setPage,
		setOrderBy,
		setOrder,
		resetFilters,
		resetPagination,
	} = useLockoutPermitFiltersStore()

	const lockoutPermits = useLockoutPermits({
		page,
		limit: 10,
		search,
		statusFilter,
		companyId,
		typeFilter,
		orderBy,
		order,
		approvedBy,
		dateRange,
	})

	return {
		filters: {
			statusFilter,
			companyId,
			approvedBy,
			typeFilter,
			dateRange,
			search,
			page,
			orderBy,
			order,
		},
		actions: {
			setStatusFilter,
			setCompanyId,
			setApprovedBy,
			setTypeFilter,
			setDateRange,
			setSearch,
			setPage,
			setOrderBy,
			setOrder,
			resetFilters,
			resetPagination,
		},
		lockoutPermits,
	}
}
