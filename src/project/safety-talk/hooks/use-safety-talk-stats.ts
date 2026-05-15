import { useQuery } from "@tanstack/react-query"

interface SafetyTalkStats {
  totalSafetyTalks: number
  approvedSafetyTalks: number
  pendingApprovalSafetyTalks: number
  expiredSafetyTalks: number
}

async function getSafetyTalkStats(): Promise<SafetyTalkStats> {
  const response = await fetch("/api/safety-talks/stats")

  if (!response.ok) {
    throw new Error("Error al obtener las estadísticas de las charlas de seguridad")
  }

  return response.json()
}

export function useSafetyTalkStats() {
  return useQuery({
    queryKey: ["safety-talk-stats"],
    queryFn: getSafetyTalkStats,
  })
}
