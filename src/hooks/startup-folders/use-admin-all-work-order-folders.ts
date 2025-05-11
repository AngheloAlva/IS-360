"use client"

import { useQuery } from "@tanstack/react-query"
import { WorkOrderStartupFolderWithDocuments } from "./use-work-order-startup-folder"

const getAllWorkOrderFolders = async (): Promise<WorkOrderStartupFolderWithDocuments[]> => {
  const response = await fetch("/api/admin/startup-folders/work-order")
  
  if (!response.ok) {
    throw new Error("Error al obtener las carpetas de arranque de órdenes de trabajo")
  }

  return response.json()
}

export function useAdminAllWorkOrderFolders() {
  return useQuery({
    queryKey: ["admin", "allWorkOrderStartupFolders"],
    queryFn: getAllWorkOrderFolders,
  })
}
