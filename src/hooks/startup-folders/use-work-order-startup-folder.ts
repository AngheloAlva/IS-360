import { useQuery } from "@tanstack/react-query"
import { 
  WorkOrderStartupFolder, 
  WorkerDocument, 
  VehicleDocument,
  ProcedureDocument,
  EnvironmentalDocument
} from "@prisma/client"

export interface WorkOrderStartupFolderWithDocuments extends WorkOrderStartupFolder {
  workOrder: {
    id: string
    otNumber: string
    type: string
    workName?: string | null
    workDescription?: string | null
    company: {
      name: string
      id: string
    }
    companyId: string
  }
  workers: (WorkerDocument & {
    uploadedBy?: {
      name: string
    }
  })[]
  vehicles: (VehicleDocument & {
    uploadedBy?: {
      name: string
    }
  })[]
  procedures: (ProcedureDocument & {
    uploadedBy?: {
      name: string
    }
  })[]
  environmentals: (EnvironmentalDocument & {
    uploadedBy?: {
      name: string
    }
  })[]
  reviewer?: {
    name: string
  } | null
  reviewComments?: string | null
  submittedBy?: {
    name: string
  } | null
}

interface UseWorkOrderStartupFolderParams {
  workOrderId?: string
  folderId?: string
  enabled?: boolean
}

export const useWorkOrderStartupFolder = ({ workOrderId, folderId, enabled = true }: UseWorkOrderStartupFolderParams = {}) => {
  return useQuery<WorkOrderStartupFolderWithDocuments>({
    queryKey: ["workOrderStartupFolder", workOrderId || folderId],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (workOrderId) searchParams.set("workOrderId", workOrderId)
      if (folderId) searchParams.set("folderId", folderId)

      const res = await fetch(`/api/startup-folders/work-order?${searchParams.toString()}`)
      if (!res.ok) throw new Error("Error fetching work order startup folder")

      return res.json()
    },
    enabled: (Boolean(workOrderId) || Boolean(folderId)) && enabled,
  })
}

export const useWorkOrderStartupFolders = () => {
  return useQuery<WorkOrderStartupFolderWithDocuments[]>({
    queryKey: ["workOrderStartupFolders"],
    queryFn: async () => {
      const res = await fetch(`/api/startup-folders/work-order/list`)
      if (!res.ok) throw new Error("Error fetching work order startup folders")

      return res.json()
    },
  })
}
