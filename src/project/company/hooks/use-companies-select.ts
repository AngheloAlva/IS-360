import { useQuery } from "@tanstack/react-query"

interface CompanyOption {
	value: string
	label: string
}

export function useCompaniesSelect() {
	return useQuery<CompanyOption[]>({
		queryKey: ["companies-select"],
		queryFn: async () => {
			const res = await fetch("/api/companies?limit=1000&showAll=true")

			if (!res.ok) {
				throw new Error("Error al cargar empresas")
			}

			const data = await res.json()

			return data.companies.map((company: { id: string; name: string }) => ({
				value: company.id,
				label: company.name,
			}))
		},
		staleTime: 1000 * 60 * 5, // 5 minutos
	})
}
