import { createContext } from "react"

interface EquipmentTreeContextValue {
	depth: number
	onNavigateToHistory: (equipmentId: string) => void
}

export const EquipmentTreeContext = createContext<EquipmentTreeContextValue | undefined>(undefined)
