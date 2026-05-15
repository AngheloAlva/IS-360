import { useQuery } from "@tanstack/react-query"

interface ChartData {
  name: string
  value: number
}

interface SafetyTalkCharts {
  byCategory: ChartData[]
  byStatus: ChartData[]
  monthlyTrend: ChartData[]
}

async function getSafetyTalkCharts(): Promise<SafetyTalkCharts> {
  const response = await fetch("/api/safety-talks/charts")

  if (!response.ok) {
    throw new Error("Error al obtener los datos de los gráficos")
  }

  return response.json()
}

export function useSafetyTalkCharts() {
  return useQuery({
    queryKey: ["safety-talk-charts"],
    queryFn: getSafetyTalkCharts,
  })
}
