"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList } from "recharts"
import { ChartColumnIcon } from "lucide-react"

import { useWorkOrderFiltersStore } from "@/project/work-order/stores/work-order-filters-store"
import { WorkOrderStatsResponse } from "@/project/work-order/hooks/use-work-order-stats"
import { WorkOrderPriorityLabels } from "@/lib/consts/work-order-priority"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

interface WorkOrderPriorityChartProps {
	data: WorkOrderStatsResponse
}

const PRIORITY_COLORS: Record<string, string> = {
	HIGH: "var(--color-red-500)",
	MEDIUM: "var(--color-orange-500)",
	LOW: "var(--color-yellow-500)",
}

export function WorkOrderPriorityChart({ data }: WorkOrderPriorityChartProps) {
	const { setPriorityFilter, priorityFilter } = useWorkOrderFiltersStore()

	const priorityData = data.charts.priority.map((item) => ({
		...item,
		name: WorkOrderPriorityLabels[item.name as keyof typeof WorkOrderPriorityLabels],
		originalName: item.name,
		color: PRIORITY_COLORS[item.name] || "var(--color-gray-500)",
	}))

	const handleBarClick = (data: { originalName: string }) => {
		const clickedPriority = data.originalName

		if (priorityFilter === clickedPriority) {
			setPriorityFilter(null)
		} else {
			setPriorityFilter(clickedPriority)
		}
	}

	return (
		<Card className="border-none transition-shadow hover:shadow-md">
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
					className="h-[250px] w-full max-w-[90dvw]"
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
						<ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis dataKey="name" />
						<YAxis dataKey="value" />

						<Bar
							dataKey="value"
							radius={[4, 4, 0, 0]}
							maxBarSize={60}
							onClick={handleBarClick}
							style={{ cursor: "pointer" }}
						>
							{priorityData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={entry.color}
									className="cursor-pointer hover:brightness-75"
									stroke={priorityFilter === entry.originalName ? "var(--text)" : "none"}
									strokeWidth={priorityFilter === entry.originalName ? 1 : 0}
								/>
							))}
							<LabelList dataKey="value" position="top" />
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
