import { persist } from "zustand/middleware"
import { create } from "zustand"

interface WorkRequestFiltersState {
	status: string | null
	isUrgent: boolean | null
	search: string
	page: number

	setStatus: (status: string | null) => void
	setIsUrgent: (isUrgent: boolean | null) => void
	setSearch: (search: string) => void
	setPage: (page: number) => void

	resetFilters: () => void
	resetPagination: () => void
}

const initialState = {
	status: null,
	isUrgent: null,
	search: "",
	page: 1,
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

			resetFilters: () => {
				set({
					status: null,
					isUrgent: null,
					search: "",
					page: 1,
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
			}),
		}
	)
)