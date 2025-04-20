import { useQuery } from "@tanstack/react-query"

interface CompanyStats {
	totalCompanies: number
	companiesBySize: {
		name: string
		employees: number
	}[]
	workOrderStatus: {
		inProgress: number
		completed: number
		cancelled: number
		pending: number
	}
	recentWorkOrders: {
		id: string
		company: string
		type: string
		status: string
		date: string
	}[]
}

export const useCompanyStats = () => {
	return useQuery<CompanyStats>({
		queryKey: ["companyStats"],
		queryFn: async () => {
			const response = await fetch("/api/companies/stats")
			if (!response.ok) {
				throw new Error("Error fetching company stats")
			}
			return response.json()
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	})
}
