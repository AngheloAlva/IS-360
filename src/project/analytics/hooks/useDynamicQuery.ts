import { useQuery } from "@tanstack/react-query"

export interface FilterCondition {
  table: string
  field: string
  operator: string
  value: string | number | boolean | null
}

export interface GroupBy {
  table: string
  field: string
}

export interface OrderBy {
  table: string
  field: string
  direction: "asc" | "desc"
}

export interface DynamicQueryParams {
  tables: string[]
  fields: Record<string, string[]>
  filters?: FilterCondition[]
  groupBy?: GroupBy[]
  orderBy?: OrderBy
  limit?: number
}

export interface DynamicQueryResult {
  results: Record<string, string | number | boolean | Date | null | Record<string, number>>[];
  metadata: {
    count: number
    fields: string[]
  }
}

export function useDynamicQuery(params: DynamicQueryParams) {
  return useQuery<DynamicQueryResult>({
    queryKey: ["dynamicQuery", params],
    queryFn: async () => {
      const response = await fetch("/api/analytics/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error en consulta dinámica: ${errorText}`)
      }
      
      const data = await response.json()
      return data as DynamicQueryResult
    },
    enabled: params.tables.length > 0 && Object.keys(params.fields).length > 0,
  })
}
