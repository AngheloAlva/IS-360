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
	createdAt: string | null
	lastActivity: string | null
	rating: number
	completedProjects: number
	onTimePercentage: number
	documentComplianceRate: number
}

interface DocumentStatusData {
	name: string
	value: number
	fill: string
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

// Nuevas interfaces para los gráficos solicitados
interface DocumentReviewProgressData {
	company: string
	reviewed: number // documentos revisados
	pending: number // documentos pendientes
	total: number // total de documentos
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
	documentStatusData: DocumentStatusData[]
	documentReviewProgressData: DocumentReviewProgressData[] // Nueva propiedad
	workOrderStatusData: WorkOrderStatusData[] // Nueva propiedad
	workEntryActivityData: WorkEntryActivityData[] // Nueva propiedad
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

export type {
	CompanyData,
	CompanyStats,
	DocumentReviewProgressData,
	WorkOrderStatusData,
	WorkEntryActivityData
}
