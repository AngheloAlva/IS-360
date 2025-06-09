"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts"
import { BarChartItem } from "@/hooks/maintenance-plans/use-maintenance-plan-stats"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface MaintenancePlanPriorityBarChartProps {
	data: BarChartItem[]
}

// Objeto que mapea prioridades a colores
const PRIORITY_COLORS = {
	HIGH: "#EF4444", // red-500 para prioridad alta
	MEDIUM: "#F59E0B", // amber-500 para prioridad media
	LOW: "#10B981", // emerald-500 para prioridad baja
}

export default function MaintenancePlanPriorityBarChart({
	data,
}: MaintenancePlanPriorityBarChartProps) {
	const colorFill = (priority: string) => {
		return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || "#6366F1"
	}

	return (
		<Card className="border">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg">Órdenes por Prioridad</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<ChartContainer config={{}} className="h-[250px] w-full">
					<BarChart data={data}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" />
						<YAxis />

						<ChartTooltip
							content={<ChartTooltipContent />}
							formatter={(value) => [`${value} órdenes`, "Cantidad"]}
							labelFormatter={(label) => `Prioridad: ${label}`}
						/>
						<Bar dataKey="value" name="Órdenes" radius={[4, 4, 0, 0]} maxBarSize={60}>
							{data.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={colorFill(entry.priority)} />
							))}
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
