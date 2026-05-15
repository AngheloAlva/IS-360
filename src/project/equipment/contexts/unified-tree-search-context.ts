import { createContext, useContext } from "react"

export interface UnifiedTreeSearchState {
  searchTerm: string
  matchedIds: Set<string>
}

const defaultState: UnifiedTreeSearchState = {
  searchTerm: "",
  matchedIds: new Set(),
}

export const UnifiedTreeSearchContext = createContext<UnifiedTreeSearchState>(defaultState)

export function useUnifiedTreeSearch(): UnifiedTreeSearchState {
  return useContext(UnifiedTreeSearchContext)
}
