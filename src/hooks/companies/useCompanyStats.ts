import { type QueryFunction, useQuery } from "@tanstack/react-query"

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
		queryFn: (fn) => fetchCompanyStats({ ...fn, queryKey: ["companyStats"] }),
	})
}

export const fetchCompanyStats: QueryFunction<CompanyStats, ["companyStats"]> = async () => {
	const response = await fetch("/api/companies/stats")
	if (!response.ok) {
		throw new Error("Error fetching company stats")
	}
	return response.json()
}
