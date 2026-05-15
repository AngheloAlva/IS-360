import { persist } from "zustand/middleware"
import { create } from "zustand"

import {
	WORK_REQUEST_SORT_BY,
	type WorkRequestSortBy,
} from "@/project/work-request/hooks/use-work-request"

type SortOrder = "asc" | "desc"

interface WorkRequestFiltersState {
	status: string | null
	isUrgent: boolean | null
	search: string
	page: number
	pageSize: number
	sortBy: WorkRequestSortBy
	sortOrder: SortOrder

	setStatus: (status: string | null) => void
	setIsUrgent: (isUrgent: boolean | null) => void
	setSearch: (search: string) => void
	setPage: (page: number) => void
	setPageSize: (pageSize: number) => void
	setSortBy: (sortBy: WorkRequestSortBy) => void
	setSortOrder: (sortOrder: SortOrder) => void

	resetFilters: () => void
	resetPagination: () => void
}

const initialState = {
	status: null,
	isUrgent: null,
	search: "",
	page: 1,
	pageSize: 15,
	sortBy: WORK_REQUEST_SORT_BY.CREATED_AT as WorkRequestSortBy,
	sortOrder: "desc" as SortOrder,
}

export const useWorkRequestFiltersStore = create<WorkRequestFiltersState>()(
	persist(
		(set) => ({
			...initialState,

			setStatus: (status) => {
				set({ status, page: 1 })
			},

			setIsUrgent: (isUrgent) => {
				set({ isUrgent, page: 1 })
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
					status: null,
					isUrgent: null,
					search: "",
					page: 1,
					pageSize: 15,
					sortBy: WORK_REQUEST_SORT_BY.CREATED_AT,
					sortOrder: "desc",
				})
			},

			resetPagination: () => {
				set({ page: 1 })
			},
		}),
		{
			name: "work-request-filters",
			partialize: (state) => ({
				status: state.status,
				isUrgent: state.isUrgent,
				search: state.search,
				pageSize: state.pageSize,
				sortBy: state.sortBy,
				sortOrder: state.sortOrder,
			}),
		}
	)
)
