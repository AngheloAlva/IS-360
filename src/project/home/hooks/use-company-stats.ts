import { useQuery } from "@tanstack/react-query"

interface CompanyInfo {
	name: string
	rut: string
	address: string | null
	phone: string | null
	email: string
	representativeName: string | null
	representativeEmail: string | null
	representativePhone: string | null
}

interface BasicStats {
	collaborators: number
	activeWorkPermits: number
	vehicles: number
	activeWorkOrders: number
}

interface WorkPermitTypeStats {
	type: string
	total: number
	active: number
	expired: number
}

interface Alert {
	type: "permit_expiring" | "missing_folder" | "vehicle_document"
	severity: "high" | "medium" | "low"
	message: string
	relatedId: string
	relatedType: "permit" | "worker" | "vehicle"
	expireDate?: string
}

interface WorkOrderActivity {
	month: string // YYYY-MM format
	totalActivities: number
	byType: {
		type: string
		count: number
	}[]
}

interface SafetyStats {
	incidentCount: number
	lastTrainingDate: string | null
	safetyScore: number
	riskLevel: "high" | "medium" | "low"
	pendingCertifications: number
}

export interface CompanyStatsResponse {
	companyInfo: CompanyInfo
	basicStats: BasicStats
	workPermitTypes: WorkPermitTypeStats[]
	recentAlerts: Alert[]
	activities: WorkOrderActivity[]
	safetyStats: SafetyStats
}

async function getCompanyStats(companyId: string): Promise<CompanyStatsResponse> {
	const response = await fetch(`/api/dashboard/company-stats?companyId=${companyId}`)

	if (!response.ok) {
		throw new Error("Error al obtener las estadísticas de la empresa")
	}

	return response.json()
}

export function useCompanyStats(companyId: string) {
	return useQuery({
		queryKey: ["company", "stats", companyId],
		queryFn: () => getCompanyStats(companyId),
	})
}
