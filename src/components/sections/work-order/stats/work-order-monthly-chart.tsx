"use client"

import { XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts"

import { WorkOrderStatsResponse } from "@/hooks/work-orders/use-work-order-stats"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartSplineIcon } from "lucide-react"

interface WorkOrderMonthlyChartProps {
	data: WorkOrderStatsResponse
}

const MONTH_NAMES = [
	"Ene",
	"Feb",
	"Mar",
	"Abr",
	"May",
	"Jun",
	"Jul",
	"Ago",
	"Sep",
	"Oct",
	"Nov",
	"Dic",
]

export function WorkOrderMonthlyChart({ data }: WorkOrderMonthlyChartProps) {
	const monthlyData = Array.from({ length: 12 }, (_, index) => {
		const monthNumber = index + 1
		const foundMonth = data.charts.monthly.find((item) => item.month === monthNumber)

		return {
			month: monthNumber,
			name: MONTH_NAMES[index],
			count: foundMonth ? foundMonth.count : 0,
		}
	})

	return (
		<Card className="border-none shadow-md">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-lg font-semibold">Tendencia Mensual de Órdenes</CardTitle>
						<CardDescription>Órdenes de Trabajo creadas en el año actual</CardDescription>
					</div>
					<ChartSplineIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<ChartContainer className="h-[250px] w-full" config={{}}>
					<AreaChart data={monthlyData} margin={{ top: 10, right: 20, left: 0 }}>
						<defs>
							<linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="var(--color-orange-500)" stopOpacity={0.8} />
								<stop offset="95%" stopColor="var(--color-orange-500)" stopOpacity={0.1} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis dataKey="name" />
						<YAxis tickFormatter={(value) => (value === 0 ? "0" : `${value}`)} />
						<ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
						<Area
							type="monotone"
							dataKey="count"
							stroke="var(--color-orange-500)"
							strokeWidth={2}
							fillOpacity={1}
							fill="url(#colorCount)"
							name="Órdenes"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
