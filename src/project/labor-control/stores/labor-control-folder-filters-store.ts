import { persist } from "zustand/middleware"
import { create } from "zustand"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

interface LaborControlFolderFiltersState {
	page: number
	order: Order
	limit: number
	search: string
	orderBy: OrderBy
	onlyWithReviewRequest?: boolean

	setPage: (page: number) => void
	setOrder: (order: Order) => void
	setLimit: (limit: number) => void
	setSearch: (search: string) => void
	setOrderBy: (orderBy: OrderBy) => void
	setOnlyWithReviewRequest: (onlyWithReviewRequest: boolean) => void

	resetFilters: () => void
}

const initialState = {
	page: 1,
	limit: 15,
	search: "",
	order: "asc" as Order,
	orderBy: "name" as OrderBy,
	onlyWithReviewRequest: false,
}

export const useLaborControlFolderFiltersStore = create<LaborControlFolderFiltersState>()(
	persist(
		(set) => ({
			...initialState,

			setPage: (page) => {
				set((state) => ({ ...state, page }))
			},

			setLimit: (limit) => {
				set((state) => ({ ...state, limit }))
			},

			setSearch: (search) => {
				set((state) => ({ ...state, search }))
			},

			setOrderBy: (orderBy) => {
				set({ orderBy })
			},

			setOrder: (order) => {
				set({ order })
			},

			setOnlyWithReviewRequest: (onlyWithReviewRequest) => {
				set({ onlyWithReviewRequest })
			},

			resetFilters: () => {
				set({
					search: "",
					order: "asc" as Order,
					orderBy: "name" as OrderBy,
					onlyWithReviewRequest: false,
				})
			},
		}),
		{
			name: "startup-folder-filters",
			partialize: (state) => ({
				order: state.order,
				search: state.search,
				orderBy: state.orderBy,
				onlyWithReviewRequest: state.onlyWithReviewRequest,
			}),
		}
	)
)
