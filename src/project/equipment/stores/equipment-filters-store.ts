import { persist } from "zustand/middleware"
import { create } from "zustand"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

interface EquipmentFiltersState {
	parentId: string | null
	showAll: boolean
	search: string
	page: number
	orderBy: OrderBy
	order: Order

	setParentId: (parentId: string | null) => void
	setShowAll: (showAll: boolean) => void
	setSearch: (search: string) => void
	setPage: (page: number) => void
	setOrderBy: (orderBy: OrderBy) => void
	setOrder: (order: Order) => void

	resetFilters: () => void
	resetPagination: () => void
}

const initialState = {
	parentId: null,
	showAll: true,
	search: "",
	page: 1,
	order: "desc" as Order,
	orderBy: "createdAt" as OrderBy,
}

export const useEquipmentFiltersStore = create<EquipmentFiltersState>()(
	persist(
		(set) => ({
			...initialState,

			setParentId: (parentId) => {
				set({ parentId, page: 1 })
			},

			setShowAll: (showAll) => {
				set({ showAll, page: 1 })
			},

			setSearch: (search) => {
				set({ search, page: 1 })
			},

			setPage: (page) => {
				set({ page })
			},

			setOrderBy: (orderBy) => {
				set({ orderBy, page: 1 })
			},

			setOrder: (order) => {
				set({ order, page: 1 })
			},

			resetFilters: () => {
				set({
					parentId: null,
					showAll: true,
					search: "",
					page: 1,
				})
			},

			resetPagination: () => {
				set({ page: 1 })
			},
		}),
		{
			name: "equipment-filters",
			partialize: (state) => ({
				parentId: state.parentId,
				showAll: state.showAll,
				search: state.search,
			}),
		}
	)
)
