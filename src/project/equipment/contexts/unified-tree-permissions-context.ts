"use client"

import { createContext, useContext } from "react"

export interface UnifiedTreePermissions {
  canCreateLocation: boolean
  canUpdateLocation: boolean
  canDeleteLocation: boolean
  canCreateEquipment: boolean
  canUpdateEquipment: boolean
  canDeleteEquipment: boolean
}

export const UnifiedTreePermissionsContext = createContext<UnifiedTreePermissions | null>(null)

export function useUnifiedTreePermissions(): UnifiedTreePermissions {
  const ctx = useContext(UnifiedTreePermissionsContext)
  if (!ctx) throw new Error("useUnifiedTreePermissions must be used within UnifiedTreePermissionsContext.Provider")
  return ctx
}
