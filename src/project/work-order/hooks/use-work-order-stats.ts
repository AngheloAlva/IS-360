import { useQuery } from "@tanstack/react-query"

interface WorkOrderCard {
  total: number
  inProgress: number
  highPriority: number
  completed: number
}

interface ChartItem {
  name: string
  value: number
}

interface MonthlyWorkOrder {
  month: number
  count: number
}

interface RecentWorkOrder {
  id: string
  otNumber: string
  status: string
  priority: string
  createdAt: string
  workName: string | null
  workProgressStatus: number | null
  company: {
    name: string
  } | null
}

interface WorkOrderCharts {
  status: ChartItem[]
  priority: ChartItem[]
  type: ChartItem[]
  companies: ChartItem[]
  monthly: MonthlyWorkOrder[]
  averageProgress: number
}

export interface WorkOrderStatsResponse {
  cards: WorkOrderCard
  charts: WorkOrderCharts
  recentWorkOrders: RecentWorkOrder[]
}

async function fetchWorkOrderStats(): Promise<WorkOrderStatsResponse> {
  const response = await fetch("/api/work-order/stats")
  
  if (!response.ok) {
    throw new Error("Error al obtener las estadísticas de órdenes de trabajo")
  }
  
  return response.json()
}

export function useWorkOrderStats() {
  return useQuery({
    queryKey: ["work-order-stats"],
    queryFn: fetchWorkOrderStats,
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // 5 minutos
  })
}
