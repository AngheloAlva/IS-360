import { useQuery } from "@tanstack/react-query"
import { CompanyDocument, GeneralStartupFolder } from "@prisma/client"

export interface GeneralStartupFolderWithDocuments extends GeneralStartupFolder {
	company: {
		name: string
		rut: string
	}
	documents: (CompanyDocument & {
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

interface UseGeneralStartupFolderParams {
	companyId: string
	folderId?: string
}

export const useGeneralStartupFolder = ({ companyId, folderId }: UseGeneralStartupFolderParams) => {
	return useQuery<GeneralStartupFolderWithDocuments>({
		queryKey: ["generalStartupFolder", companyId || folderId],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			if (companyId) searchParams.set("companyId", companyId)
			if (folderId) searchParams.set("folderId", folderId)

			const res = await fetch(`/api/startup-folders/general?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching general startup folder")

			return res.json()
		},
	})
}

export const useCompanyGeneralStartupFolders = () => {
	return useQuery<GeneralStartupFolderWithDocuments[]>({
		queryKey: ["generalStartupFolders"],
		queryFn: async () => {
			const res = await fetch(`/api/startup-folders/general/list`)
			if (!res.ok) throw new Error("Error fetching general startup folders")

			return res.json()
		},
	})
}
