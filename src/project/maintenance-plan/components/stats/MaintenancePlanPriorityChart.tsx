"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList } from "recharts"
import { ChartColumnIcon } from "lucide-react"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

import type { BarChartItem } from "@/project/maintenance-plan/hooks/use-maintenance-plan-stats"

interface MaintenancePlanPriorityChartProps {
	data: BarChartItem[]
}

export default function MaintenancePlanPriorityChart({ data }: MaintenancePlanPriorityChartProps) {
	return (
		<Card className="border">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Tareas por Prioridad</CardTitle>
						<CardDescription>Distribución de las tareas según su prioridad</CardDescription>
					</div>
					<ChartColumnIcon className="text-muted-foreground h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<ChartContainer
					config={{
						HIGH: {
							label: "Alta",
						},
						MEDIUM: {
							label: "Media",
						},
						LOW: {
							label: "Baja",
						},
					}}
					className="h-[250px] w-full max-w-[90dvw]"
				>
					<BarChart data={data} margin={{ top: 15 }}>
						<ChartTooltip content={<ChartTooltipContent nameKey="priority" />} />

						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="priority" />
						<YAxis dataKey="value" />

						<Bar dataKey="value" name="Órdenes" radius={[4, 4, 0, 0]} maxBarSize={60}>
							{data.map((item, index) => (
								<Cell key={index} fill={item.fill} />
							))}

							<LabelList dataKey="value" position="top" />
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
