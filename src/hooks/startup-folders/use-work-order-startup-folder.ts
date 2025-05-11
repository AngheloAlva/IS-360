import { useQuery } from "@tanstack/react-query"
import type {
	WorkerDocument,
	VehicleDocument,
	WORK_ORDER_TYPE,
	ProcedureDocument,
	EnvironmentalDocument,
	WorkOrderStartupFolder,
} from "@prisma/client"

export interface WorkOrderStartupFolderWithDocuments extends WorkOrderStartupFolder {
	workOrder: {
		id: string
		otNumber: string
		type: WORK_ORDER_TYPE
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
}

export const useWorkOrderStartupFolder = ({
	workOrderId,
	folderId,
}: UseWorkOrderStartupFolderParams = {}) => {
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
