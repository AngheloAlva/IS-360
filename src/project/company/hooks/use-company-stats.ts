import { useQuery } from "@tanstack/react-query"

interface CompanyData {
	id: string
	name: string
	rut: string
	image: string
	activeUsers: number
	activeWorkOrders: number
	vehicles: number
	pendingDocuments: number
	reviewingDocuments: number
	approvedDocuments: number
	createdAt: string | null
	lastActivity: string | null
	rating: number
	completedProjects: number
	onTimePercentage: number
	documentComplianceRate: number
}

interface TopCompanyData {
	name: string
	workOrders: number
	users: number
}

interface RegistrationTrendData {
	month: string
	companies: number
}

interface ComplianceAreaData {
	name: string
	rate: number
}

interface WorkOrderStatusData {
	company: string
	planned: number
	inProgress: number
	completed: number
	cancelled: number
}

interface WorkEntryActivityData {
	date: string // formato YYYY-MM-DD
	companyId: string
	companyName: string
	count: number // número de entradas para ese día y empresa
}

interface CompanyStats {
	companiesData: CompanyData[]
	workOrderStatusData: WorkOrderStatusData[]
	workEntryActivityData: WorkEntryActivityData[]
	topCompaniesData: TopCompanyData[]
	registrationTrendData: RegistrationTrendData[]
	complianceByAreaData: ComplianceAreaData[]
}

export function useCompanyStats() {
	return useQuery<CompanyStats>({
		queryKey: ["company-stats"],
		queryFn: async () => {
			const response = await fetch("/api/companies/stats")
			if (!response.ok) {
				throw new Error("Error al obtener estadísticas de empresas")
			}
			return response.json()
		},
		staleTime: 1000 * 60 * 5,
		refetchOnWindowFocus: false,
	})
}

export type { CompanyData, CompanyStats, WorkOrderStatusData, WorkEntryActivityData }
