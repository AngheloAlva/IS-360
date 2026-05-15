import { create } from "zustand"

interface WorkOrderSelectionState {
	selectedIds: Array<{ id: string; otNumber: string; workRequest: string }>
	addSelection: (id: string, otNumber: string, workRequest: string) => void
	removeSelection: (id: string) => void
	toggleSelection: (id: string, otNumber: string, workRequest: string) => void
	clearSelection: () => void
	isSelected: (id: string) => boolean
	getSelectedIds: () => string[]
	getSelectedCount: () => number
}

export const useWorkOrderSelectionStore = create<WorkOrderSelectionState>((set, get) => ({
	selectedIds: [],

	addSelection: (id: string, otNumber: string, workRequest: string) => {
		set((state) => ({
			selectedIds: [...state.selectedIds, { id, otNumber, workRequest }],
		}))
	},

	removeSelection: (id: string) => {
		set((state) => {
			const newSelected = state.selectedIds.filter((wo) => wo.id !== id)
			return { selectedIds: newSelected }
		})
	},

	toggleSelection: (id: string, otNumber: string, workRequest: string) => {
		const { selectedIds } = get()
		if (selectedIds.some((wo) => wo.id === id)) {
			get().removeSelection(id)
		} else {
			get().addSelection(id, otNumber, workRequest)
		}
	},

	clearSelection: () => {
		set({ selectedIds: [] })
	},

	isSelected: (id: string) => {
		return get().selectedIds.some((wo) => wo.id === id)
	},

	getSelectedIds: () => {
		return get().selectedIds.map((wo) => wo.id)
	},

	getSelectedCount: () => {
		return get().selectedIds.length
	},
}))
