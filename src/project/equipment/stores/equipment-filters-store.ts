import { persist } from "zustand/middleware"
import { create } from "zustand"

import type { Order } from "@/shared/components/OrderByButton"
import type { EquipmentSortBy } from "@/project/equipment/hooks/use-equipments"

interface EquipmentFiltersState {
	parentId: string | null
	showAll: boolean
	search: string
	page: number
	pageSize: number
	orderBy: EquipmentSortBy
	order: Order

	setParentId: (parentId: string | null) => void
	setShowAll: (showAll: boolean) => void
	setSearch: (search: string) => void
	setPage: (page: number) => void
	setPageSize: (pageSize: number) => void
	setOrderBy: (orderBy: EquipmentSortBy) => void
	setOrder: (order: Order) => void

	resetFilters: () => void
	resetPagination: () => void
}

const initialState = {
	parentId: null,
	showAll: true,
	search: "",
	page: 1,
	pageSize: 15,
	order: "desc" as Order,
	orderBy: "createdAt" as EquipmentSortBy,
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
					parentId: null,
					showAll: true,
					search: "",
					page: 1,
					pageSize: 15,
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
				pageSize: state.pageSize,
				order: state.order,
				orderBy: state.orderBy,
			}),
		}
	)
)
