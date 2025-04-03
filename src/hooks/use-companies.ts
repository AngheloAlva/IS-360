import { useQuery } from "@tanstack/react-query"

export interface Company {
	id: string
	name: string
	rut: string
}

export const useCompanies = () => {
	return useQuery<Company[]>({
		queryKey: ["companies"],
		queryFn: async () => {
			const res = await fetch("/api/companies")
			if (!res.ok) throw new Error("Error fetching companies")
			return res.json()
		},
	})
}
