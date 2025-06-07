import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid } from "recharts"
import { BarChart3 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

import type { ModuleActivityItem } from "@/hooks/dashboard/use-homepage-stats"

interface ModuleActivityChartProps {
	data: ModuleActivityItem[]
	isLoading: boolean
}

export function ModuleActivityChart({ data, isLoading }: ModuleActivityChartProps) {
	if (isLoading) {
		return <ModuleActivityChartSkeleton />
	}

	return (
		<Card className="border-none">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Actividad por Módulo</CardTitle>
					<CardDescription>Porcentaje de elementos activos</CardDescription>
				</div>
				<BarChart3 className="text-muted-foreground h-4 w-4" />
			</CardHeader>
			<CardContent className="px-2 py-0">
				<div className="h-[250px] w-full">
					<ChartContainer config={{}} className="h-full w-full">
						<BarChart data={data} layout="vertical">
							<CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
							<XAxis type="number" domain={[0, 100]} />
							<YAxis dataKey="module" type="category" width={90} />

							<ChartTooltip
								content={<ChartTooltipContent formatter={(value) => [`${value}%`, "Actividad"]} />}
							/>
							<Bar dataKey="percentage" name="% Activo" barSize={20} radius={[0, 4, 4, 0]}>
								{data.map((entry, index) => {
									let color = "var(--color-red-500)"
									if (entry.percentage >= 80) color = "var(--color-green-500)"
									else if (entry.percentage >= 60) color = "var(--color-yellow-500)"
									return <Cell key={`cell-${index}`} fill={color} />
								})}
							</Bar>
						</BarChart>
					</ChartContainer>
				</div>
			</CardContent>
		</Card>
	)
}

function ModuleActivityChartSkeleton() {
	return (
		<Card className="col-span-1 shadow-md">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<Skeleton className="mb-2 h-6 w-48" />
					<Skeleton className="h-4 w-36" />
				</div>
				<Skeleton className="h-4 w-4 rounded" />
			</CardHeader>
			<CardContent>
				<div className="h-[250px] w-full">
					<Skeleton className="h-full w-full rounded" />
				</div>
			</CardContent>
		</Card>
	)
}
