"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts"
import { ChartColumnIcon } from "lucide-react"

import { WorkOrderStatsResponse } from "@/features/work-order/hooks/use-work-order-stats"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"

interface WorkOrderPriorityChartProps {
	data: WorkOrderStatsResponse
}

const PRIORITY_COLORS: Record<string, string> = {
	HIGH: "var(--color-red-500)",
	MEDIUM: "var(--color-orange-500)",
	LOW: "var(--color-yellow-500)",
}

export function WorkOrderPriorityChart({ data }: WorkOrderPriorityChartProps) {
	const priorityData = data.charts.priority.map((item) => ({
		...item,
		color: PRIORITY_COLORS[item.name] || "var(--color-gray-500)",
	}))

	return (
		<Card className="border-none">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-lg font-semibold">Distribución por Prioridad</CardTitle>
						<CardDescription>Órdenes de Trabajo dividas por prioridad</CardDescription>
					</div>
					<ChartColumnIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<ChartContainer
					className="h-[250px] w-full"
					config={{
						LOW: {
							label: "Baja",
						},
						MEDIUM: {
							label: "Media",
						},
						HIGH: {
							label: "Alta",
						},
					}}
				>
					<BarChart data={priorityData} margin={{ top: 10, right: 20, left: 0 }}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis dataKey="name" />
						<YAxis dataKey="value" />
						<ChartTooltip content={<ChartTooltipContent nameKey="name" />} />

						<Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
							{priorityData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={entry.color} />
							))}
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
