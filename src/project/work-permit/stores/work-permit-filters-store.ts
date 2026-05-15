import { persist } from "zustand/middleware"
import { create } from "zustand"
import type { DateRange } from "react-day-picker"

import type {
	WorkPermitSortBy,
	WorkPermitSortOrder,
} from "@/project/work-permit/hooks/use-work-permit"

interface WorkPermitFiltersState {
	statusFilter: string | null
	companyId: string | null
	approvedBy: string | null
	typeFilter: string | null
	dateRange: DateRange | null
	hasLockoutPermit: boolean | null
	search: string
	page: number
	pageSize: number
	sortBy: WorkPermitSortBy
	sortOrder: WorkPermitSortOrder

	setStatusFilter: (status: string | null) => void
	setCompanyId: (companyId: string | null) => void
	setApprovedBy: (approvedBy: string | null) => void
	setTypeFilter: (type: string | null) => void
	setDateRange: (range: DateRange | null) => void
	setHasLockoutPermit: (hasLockoutPermit: boolean | null) => void
	setSearch: (search: string) => void
	setPage: (page: number) => void
	setPageSize: (pageSize: number) => void
	setSortBy: (sortBy: WorkPermitSortBy) => void
	setSortOrder: (sortOrder: WorkPermitSortOrder) => void

	resetFilters: () => void
	resetPagination: () => void
}

const initialState = {
	statusFilter: null,
	companyId: null,
	approvedBy: null,
	typeFilter: null,
	dateRange: null,
	hasLockoutPermit: null,
	search: "",
	page: 1,
	pageSize: 10,
	sortBy: "createdAt" as WorkPermitSortBy,
	sortOrder: "desc" as WorkPermitSortOrder,
}

export const useWorkPermitFiltersStore = create<WorkPermitFiltersState>()(
	persist(
		(set) => ({
			...initialState,

			setStatusFilter: (statusFilter) => {
				set({ statusFilter, page: 1 })
			},

			setCompanyId: (companyId) => {
				set({ companyId, page: 1 })
			},

			setApprovedBy: (approvedBy) => {
				set({ approvedBy, page: 1 })
			},

			setTypeFilter: (typeFilter) => {
				set({ typeFilter, page: 1 })
			},

			setDateRange: (dateRange) => {
				set({ dateRange, page: 1 })
			},

			setHasLockoutPermit: (hasLockoutPermit) => {
				set({ hasLockoutPermit, page: 1 })
			},

			setSearch: (search) => {
				set({ search, page: 1 })
			},

			setPage: (page) => {
				set({ page })
			},

			setPageSize: (pageSize) => {
				set({ pageSize, page: 1 })
			},

			setSortBy: (sortBy) => {
				set({ sortBy, page: 1 })
			},

			setSortOrder: (sortOrder) => {
				set({ sortOrder, page: 1 })
			},

			resetFilters: () => {
				set({
					statusFilter: null,
					companyId: null,
					approvedBy: null,
					typeFilter: null,
					hasLockoutPermit: null,
					dateRange: null,
					search: "",
					page: 1,
					pageSize: initialState.pageSize,
					sortBy: initialState.sortBy,
					sortOrder: initialState.sortOrder,
				})
			},

			resetPagination: () => {
				set({ page: 1 })
			},
		}),
		{
			name: "work-permit-filters",
			partialize: (state) => ({
				statusFilter: state.statusFilter,
				companyId: state.companyId,
				approvedBy: state.approvedBy,
				typeFilter: state.typeFilter,
				dateRange: state.dateRange,
				hasLockoutPermit: state.hasLockoutPermit,
				search: state.search,
				pageSize: state.pageSize,
				sortBy: state.sortBy,
				sortOrder: state.sortOrder,
			}),
		}
	)
)
