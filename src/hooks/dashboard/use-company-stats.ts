import { useQuery } from "@tanstack/react-query"

interface WorkOrderStats {
    total: number
    planned: number
    inProgress: number
    completed: number
    upcoming: Array<{
        id: string
        otNumber: string
        workName: string | null
        workDescription: string | null
        programDate: string
        status: string
        type: string
        workLocation: string | null
    }>
}

interface UserStats {
    total: number
}

export interface CompanyStatsResponse {
    workOrders: WorkOrderStats
    users: UserStats
}

async function getCompanyStats(companyId?: string): Promise<CompanyStatsResponse> {
    if (!companyId) {
        throw new Error("ID de empresa requerido")
    }

    const response = await fetch(`/api/dashboard/company-stats?companyId=${companyId}`)

    if (!response.ok) {
        throw new Error("Error al obtener las estadísticas de la empresa")
    }

    return response.json()
}

export function useCompanyStats(companyId?: string) {
    return useQuery({
        queryKey: ["company", "stats", companyId],
        queryFn: () => getCompanyStats(companyId),
        enabled: !!companyId,
    })
}
