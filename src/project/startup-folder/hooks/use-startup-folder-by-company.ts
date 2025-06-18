import { type QueryFunction, useQuery } from "@tanstack/react-query"

export interface StartupFolderByCompany {
	id: string
	name: string
}

interface UseStartupFolderParams {
	companyId: string
}

export const fetchStartupFolderByCompany: QueryFunction<
	StartupFolderByCompany[],
	readonly ["startupFolderByCompany", { companyId: string }]
> = async ({ queryKey }) => {
	const [, { companyId }] = queryKey

	const res = await fetch(`/api/startup-folders/by-company/${companyId}`)
	if (!res.ok) throw new Error("Error fetching general startup folder")

	return res.json()
}

export const useStartupFolderByCompany = ({ companyId }: UseStartupFolderParams) => {
	const queryKey = ["startupFolderByCompany", { companyId }] as const

	return useQuery({
		queryKey,
		enabled: !!companyId,
		queryFn: fetchStartupFolderByCompany,
	})
}
