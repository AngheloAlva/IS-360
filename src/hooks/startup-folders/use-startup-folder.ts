import { useQuery } from "@tanstack/react-query"

import type {
	StartupFolder,
	WorkerDocument,
	CompanyDocument,
	VehicleDocument,
	ProcedureDocument,
	EnvironmentalDocument,
} from "@prisma/client"

export interface StartupFolderWithDocuments extends StartupFolder {
	company: {
		name: string
		rut: string
	}
	companyDocuments: (CompanyDocument & {
		uploadedBy?: {
			name: string
		}
	})[]
	reviewComments?: string | null
	submittedBy?: {
		name: string
	} | null
	environmentalsDocuments: EnvironmentalDocument[]
	proceduresDocuments: ProcedureDocument[]
	workersDocuments: WorkerDocument[]
	vehiclesDocuments: VehicleDocument[]
}

interface UseStartupFolderParams {
	companyId: string
	folderId?: string
}

export const useStartupFolder = ({ companyId, folderId }: UseStartupFolderParams) => {
	return useQuery<StartupFolderWithDocuments>({
		queryKey: ["startupFolder", companyId || folderId],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			if (companyId) searchParams.set("companyId", companyId)
			if (folderId) searchParams.set("folderId", folderId)

			const res = await fetch(`/api/startup-folders?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching general startup folder")

			return res.json()
		},
	})
}

export const useCompanyStartupFolders = () => {
	return useQuery<StartupFolderWithDocuments[]>({
		queryKey: ["startupFolders"],
		queryFn: async () => {
			const res = await fetch(`/api/startup-folders/list`)
			if (!res.ok) throw new Error("Error fetching general startup folders")

			return res.json()
		},
	})
}
