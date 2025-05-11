import { useQuery } from "@tanstack/react-query"
import { CompanyDocument, GeneralStartupFolder } from "@prisma/client"

export interface AdminGeneralStartupFolderWithDocuments extends GeneralStartupFolder {
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
		id: string
		name: string
	} | null
	submittedBy?: {
		id: string
		name: string
	} | null
}

interface UseAdminGeneralStartupFolderParams {
	folderId: string
}

export const useAdminGeneralStartupFolder = ({ folderId }: UseAdminGeneralStartupFolderParams) => {
	return useQuery<AdminGeneralStartupFolderWithDocuments>({
		queryKey: ["adminGeneralStartupFolder", folderId],
		queryFn: async () => {
			const res = await fetch(`/api/admin/startup-folders/general/${folderId}`)
			if (!res.ok) throw new Error("Error fetching general startup folder")

			return res.json()
		},
	})
}
