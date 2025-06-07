import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface KeyMetricsProps {
  isLoading: boolean
}

export function KeyMetrics({ isLoading }: KeyMetricsProps) {
  if (isLoading) {
    return <KeyMetricsSkeleton />
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Métricas Clave del Sistema</CardTitle>
            <CardDescription>Indicadores principales de rendimiento y estado</CardDescription>
          </div>
          <BarChart3 className="text-muted-foreground h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-emerald-50 p-4 text-center dark:bg-emerald-900/20">
            <div className="text-2xl font-bold text-emerald-600">92%</div>
            <div className="text-muted-foreground text-sm">Cumplimiento General</div>
          </div>
          <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-900/20">
            <div className="text-2xl font-bold text-blue-600">86%</div>
            <div className="text-muted-foreground text-sm">Equipos Operacionales</div>
          </div>
          <div className="rounded-lg bg-amber-50 p-4 text-center dark:bg-amber-900/20">
            <div className="text-2xl font-bold text-amber-600">5</div>
            <div className="text-muted-foreground text-sm">Alertas Activas</div>
          </div>
          <div className="rounded-lg bg-purple-50 p-4 text-center dark:bg-purple-900/20">
            <div className="text-2xl font-bold text-purple-600">24h</div>
            <div className="text-muted-foreground text-sm">Tiempo Promedio Respuesta</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function KeyMetricsSkeleton() {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
