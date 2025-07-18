import { persist } from "zustand/middleware"
import { create } from "zustand"

interface EquipmentFiltersState {
	parentId: string | null
	showAll: boolean
	search: string
	page: number

	setParentId: (parentId: string | null) => void
	setShowAll: (showAll: boolean) => void
	setSearch: (search: string) => void
	setPage: (page: number) => void

	resetFilters: () => void
	resetPagination: () => void
}

const initialState = {
	parentId: null,
	showAll: true,
	search: "",
	page: 1,
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