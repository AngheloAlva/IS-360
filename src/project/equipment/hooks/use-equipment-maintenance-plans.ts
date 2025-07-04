import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

export interface EquipmentMaintenancePlan {
  id: string
  name: string
  description: string | null
  status: string
  startDate: string
  endDate: string
  frequency: string
  location: string
  createdAt: string
  updatedAt: string
  _count: {
    tasks: number
  }
}

interface UseEquipmentMaintenancePlansOptions {
  enabled?: boolean
  limit?: number
}

export const useEquipmentMaintenancePlans = (
  equipmentId: string,
  options?: UseEquipmentMaintenancePlansOptions & Omit<UseQueryOptions<EquipmentMaintenancePlan[]>, "queryKey" | "queryFn">
) => {
  const { limit = 5, enabled = true, ...queryOptions } = options || {}

  return useQuery<EquipmentMaintenancePlan[]>({
    queryKey: ["equipment", equipmentId, "maintenance-plans", { limit }],
    queryFn: async () => {
      if (!equipmentId) return []

      const searchParams = new URLSearchParams()
      searchParams.set("limit", limit.toString())

      const res = await fetch(`/api/equipments/${equipmentId}/maintenance-plans?${searchParams.toString()}`)
      if (!res.ok) throw new Error("Error fetching equipment maintenance plans")

      return res.json()
    },
    enabled: !!equipmentId && enabled,
    ...queryOptions
  })
}
