import { persist } from "zustand/middleware"
import { create } from "zustand"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

interface UserFiltersState {
	search: string
	area: string
	page: number
	pageSize: number
	orderBy: OrderBy
	order: Order

	setSearch: (search: string) => void
	setArea: (area: string) => void
	setPage: (page: number) => void
	setPageSize: (pageSize: number) => void
	setOrderBy: (orderBy: OrderBy) => void
	setOrder: (order: Order) => void

	resetFilters: () => void
	resetPagination: () => void
}

const initialState = {
	search: "",
	area: "all",
	page: 1,
	pageSize: 15,
	orderBy: "createdAt" as OrderBy,
	order: "asc" as Order,
}

export const useUserFiltersStore = create<UserFiltersState>()(
	persist(
		(set) => ({
			...initialState,

			setSearch: (search) => {
				set({ search, page: 1 })
			},

			setArea: (area) => {
				set({ area, page: 1 })
			},

			setPage: (page) => {
				set({ page })
			},

			setPageSize: (pageSize) => {
				set({ pageSize, page: 1 })
			},

			setOrderBy: (orderBy) => {
				set({ orderBy, page: 1 })
			},

			setOrder: (order) => {
				set({ order, page: 1 })
			},

			resetFilters: () => {
				set({
					search: "",
					area: "all",
					page: 1,
					pageSize: 15,
					orderBy: "createdAt",
					order: "asc",
				})
			},

			resetPagination: () => {
				set({ page: 1 })
			},
		}),
		{
			name: "user-filters",
			partialize: (state) => ({
				search: state.search,
				area: state.area,
				pageSize: state.pageSize,
				orderBy: state.orderBy,
				order: state.order,
			}),
		}
	)
)
