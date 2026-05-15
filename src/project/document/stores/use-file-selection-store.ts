import { persist } from "zustand/middleware"
import { create } from "zustand"

interface SelectedFile {
	id: string
	url: string
	name: string
}

interface FileSelectionStore {
	selectedFiles: SelectedFile[]
	toggleSelection: (file: SelectedFile) => void
	clearSelection: () => void
	isSelected: (fileId: string) => boolean
	setSelection: (files: SelectedFile[]) => void
}

export const useFileSelectionStore = create<FileSelectionStore>()(
	persist(
		(set, get) => ({
			selectedFiles: [],
			toggleSelection: (file) => {
				const { selectedFiles } = get()
				const exists = selectedFiles.some((f) => f.id === file.id)
				if (exists) {
					set({ selectedFiles: selectedFiles.filter((f) => f.id !== file.id) })
				} else {
					set({ selectedFiles: [...selectedFiles, file] })
				}
			},
			clearSelection: () => set({ selectedFiles: [] }),
			isSelected: (fileId) => get().selectedFiles.some((f) => f.id === fileId),
			setSelection: (files) => set({ selectedFiles: files }),
		}),
		{
			name: "file-selection-storage",
		}
	)
)
