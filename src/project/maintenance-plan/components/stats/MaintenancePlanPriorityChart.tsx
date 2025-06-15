"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts"
import { BarChartItem } from "@/project/maintenance-plan/hooks/use-maintenance-plan-stats"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"

interface MaintenancePlanPriorityChartProps {
	data: BarChartItem[]
}

const PRIORITY_COLORS = {
	HIGH: "var(--color-red-500)",
	MEDIUM: "var(--color-amber-500)",
	LOW: "var(--color-emerald-500)",
}

export default function MaintenancePlanPriorityChart({ data }: MaintenancePlanPriorityChartProps) {
	const colorFill = (priority: string) => {
		return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || "var(--color-blue-500)"
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
