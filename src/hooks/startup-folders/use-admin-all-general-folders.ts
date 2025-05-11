"use client"

import { useQuery } from "@tanstack/react-query"
import { GeneralStartupFolderWithDocuments } from "./use-general-startup-folder"

const getAllGeneralFolders = async (): Promise<GeneralStartupFolderWithDocuments[]> => {
  const response = await fetch("/api/admin/startup-folders/general")
  
  if (!response.ok) {
    throw new Error("Error al obtener las carpetas de arranque generales")
  }

  return response.json()
}

export function useAdminAllGeneralFolders() {
  return useQuery({
    queryKey: ["admin", "allGeneralStartupFolders"],
    queryFn: getAllGeneralFolders,
  })
}
