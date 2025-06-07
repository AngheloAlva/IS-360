"use client"

import { Area, XAxis, YAxis, AreaChart, CartesianGrid } from "recharts"
import { ChartSplineIcon } from "lucide-react"

import { MaintenanceActivityData } from "@/hooks/use-equipment-stats"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface MaintenanceActivityChartProps {
	data: MaintenanceActivityData[]
}

export default function MaintenanceActivityChart({ data }: MaintenanceActivityChartProps) {
	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return `${date.getDate()}/${date.getMonth() + 1}`
	}

	return (
		<Card className="border-none">
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Actividades realizadas (Últimos 30 días)</CardTitle>
						<CardDescription>Órdenes de trabajo realizadas en los últimos 30 días</CardDescription>
					</div>
					<ChartSplineIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>

			<CardContent className="py-0">
				<ChartContainer config={{}} className="h-[250px] w-full">
					<AreaChart
						data={data}
						margin={{
							top: 10,
							left: 0,
							bottom: 0,
						}}
					>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
						<YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
						<ChartTooltip
							content={<ChartTooltipContent />}
							formatter={(value: number) => [`${value} órdenes`, "Órdenes de trabajo"]}
							labelFormatter={(label) => {
								const date = new Date(label)
								return date.toLocaleDateString("es-ES", {
									year: "numeric",
									month: "short",
									day: "numeric",
								})
							}}
						/>

						<defs>
							<linearGradient id="fillColor" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="var(--color-emerald-600)" stopOpacity={0.8} />
								<stop offset="95%" stopColor="var(--color-emerald-600)" stopOpacity={0.1} />
							</linearGradient>
						</defs>

						<Area
							type="monotone"
							dataKey="count"
							fillOpacity={0.6}
							activeDot={{ r: 6 }}
							fill="url(#fillColor)"
							stroke="var(--color-emerald-600)"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
