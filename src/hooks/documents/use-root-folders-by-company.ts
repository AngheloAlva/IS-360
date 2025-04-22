import { useQuery } from "@tanstack/react-query"

import { ROOT_FOLDER_TYPE } from "@prisma/client"

export interface RootFolder {
	id: string
	slug: string
	name: string
	type: ROOT_FOLDER_TYPE
	description: string | null
	createdAt: Date
	updatedAt: Date
	_count: {
		files: number
	}
}

export interface RootFolderFile {
	id: string
	url: string
	size: number
	type: string
	name: string
}

interface UseRootFoldersByCompanyParams {
	companyId: string
	parentFolderSlug?: string | null
}

interface RootFoldersResponse {
	rootFolders: RootFolder[]
	files: RootFolderFile[] | null
}

export const useRootFoldersByCompany = ({
	companyId,
	parentFolderSlug,
}: UseRootFoldersByCompanyParams) => {
	return useQuery<RootFoldersResponse>({
		queryKey: ["root-folders-by-company", { companyId, parentFolderSlug }],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			if (parentFolderSlug) searchParams.set("parentFolderSlug", parentFolderSlug)

			const res = await fetch(`/api/root-folders/company/${companyId}?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching root folders")

			return res.json()
		},
	})
}
