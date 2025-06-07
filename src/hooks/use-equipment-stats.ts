import { useQuery } from "@tanstack/react-query"

// Types for equipment statistics data
export interface EquipmentStatusData {
  status: string
  count: number
}

export interface EquipmentTypeData {
  type: string
  count: number
}

export interface EquipmentCriticalityData {
  criticality: string
  count: number
}

export interface WorkOrderStatusData {
  status: string
  count: number
}

export interface TopEquipmentData {
  id: string
  name: string
  tag: string
  workOrderCount: number
}

export interface EquipmentHierarchyData {
  parentEquipment: number
  childEquipment: number
}

export interface MaintenanceActivityData {
  date: string
  count: number
}

export interface EquipmentStatsData {
  totalEquipment: number
  equipmentByStatus: EquipmentStatusData[]
  equipmentByType: EquipmentTypeData[]
  equipmentByCriticality: EquipmentCriticalityData[]
  workOrdersByStatus: WorkOrderStatusData[]
  topEquipmentWithWorkOrders: TopEquipmentData[]
  equipmentHierarchy: EquipmentHierarchyData
  maintenanceActivityData: MaintenanceActivityData[]
}

// Fetch equipment statistics
export const fetchEquipmentStats = async (): Promise<EquipmentStatsData> => {
  const response = await fetch("/api/equipments/stats")
  
  if (!response.ok) {
    throw new Error("Failed to fetch equipment statistics")
  }

  return response.json()
}

// Hook to use equipment statistics
export const useEquipmentStats = () => {
  return useQuery<EquipmentStatsData>({
    queryKey: ["equipment-stats"],
    queryFn: fetchEquipmentStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
