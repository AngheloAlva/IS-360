"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartSplineIcon } from "lucide-react"

import { AreaChartItem } from "@/project/maintenance-plan/hooks/use-maintenance-plan-stats"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

interface MaintenancePlanChartProps {
	data: AreaChartItem[]
}

export default function MaintenancePlanChart({ data }: MaintenancePlanChartProps) {
	return (
		<Card className="border">
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Tareas creadas por mes</CardTitle>
						<CardDescription>Cantidad de tareas creadas en los últimos meses</CardDescription>
					</div>
					<ChartSplineIcon className="text-muted-foreground h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent>
				<ChartContainer config={{}} className="h-[250px] w-full max-w-[90dvw]">
					<AreaChart
						data={data}
						margin={{
							top: 10,
							right: 30,
							left: 0,
							bottom: 0,
						}}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="date" />
						<YAxis allowDecimals={false} />
						<ChartTooltip
							content={<ChartTooltipContent />}
							labelFormatter={(label) => `Período: ${label}`}
						/>
						<Area
							type="monotone"
							dataKey="tasks"
							name="Tareas"
							stroke="var(--color-purple-500)"
							fill="url(#colorTasks)"
							strokeWidth={2}
						/>
						<defs>
							<linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="var(--color-purple-500)" stopOpacity={0.8} />
								<stop offset="95%" stopColor="var(--color-purple-500)" stopOpacity={0.1} />
							</linearGradient>
						</defs>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
