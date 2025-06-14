import { useQuery } from "@tanstack/react-query"

// Interface for system overview data
export interface SystemOverviewData {
  companies: {
    total: number
    active: number
    withPendingDocs: number
  }
  equipment: {
    total: number
    operational: number
    critical: number
  }
  users: {
    total: number
    active: number
    admins: number
  }
  workOrders: {
    total: number
    inProgress: number
    critical: number
  }
  permits: {
    total: number
    active: number
    critical: number
  }
  maintenancePlans: {
    total: number
    active: number
    overdue: number
  }
  startupFolders: {
    total: number
    completed: number
    overdue: number
  }
}

// Interface for system health data
export interface SystemHealthItem {
  name: string
  value: number
  color: string
}

// Interface for module activity data
export interface ModuleActivityItem {
  module: string
  percentage: number
}

// Interface for weekly activity data
export interface WeeklyActivityItem {
  day: string
  workOrders: number
  permits: number
  maintenance: number
}

// Interface for alert data
export interface AlertItem {
  id: number
  type: "info" | "warning" | "urgent"
  message: string
  module: string
  time: string
}

// Interface for recent activity data
export interface RecentActivityItem {
  id: number
  action: string
  module: string
  user: string
  time: string
}

// Interface for the complete homepage stats response
export interface HomepageStatsResponse {
  systemOverviewData: SystemOverviewData
  systemHealthData: SystemHealthItem[]
  moduleActivityData: ModuleActivityItem[]
  weeklyActivityData: WeeklyActivityItem[]
  alerts: AlertItem[]
  recentActivity: RecentActivityItem[]
}

// Function to fetch homepage stats from the API
async function getHomepageStats(): Promise<HomepageStatsResponse> {
  const response = await fetch("/api/dashboard/homepage-stats")

  if (!response.ok) {
    throw new Error("Error al obtener las estadísticas del dashboard")
  }

  return response.json()
}

// Custom hook for fetching homepage stats
export function useHomepageStats() {
  return useQuery({
    queryKey: ["dashboard", "homepage-stats"],
    queryFn: getHomepageStats,
  })
}
