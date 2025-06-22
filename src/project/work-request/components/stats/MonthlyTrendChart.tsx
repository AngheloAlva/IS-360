"use client"

import { Area, XAxis, YAxis, AreaChart, CartesianGrid } from "recharts"
import { ChartSplineIcon } from "lucide-react"
import { format, addMonths } from "date-fns"

import { WorkRequestStatsResponse } from "@/project/work-request/hooks/use-work-request-stats"

import {
	ChartLegend,
	ChartTooltip,
	ChartContainer,
	ChartLegendContent,
	ChartTooltipContent,
} from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

interface MonthlyTrendChartProps {
	data: WorkRequestStatsResponse["monthlyTrend"]
}

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
	return (
		<Card className="border-none">
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-base font-medium">Tendencia Mensual</CardTitle>
						<CardDescription>
							Solicitudes de trabajo creadas y atendidas por mes los últimos 12 meses
						</CardDescription>
					</div>
					<ChartSplineIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>

			<CardContent className="p-0">
				<div className="h-[240px] w-full">
					<ChartContainer
						config={{
							created: {
								label: "Creadas",
							},
							attended: {
								label: "Atendidas",
							},
						}}
						className="h-[250px] w-full"
					>
						<AreaChart data={data} margin={{ right: 20 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="month"
								tickFormatter={(date) => format(addMonths(new Date(date), 1), "MMM-yyyy")}
								tick={{ fontSize: 12 }}
							/>
							<YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<ChartLegend content={<ChartLegendContent />} />

							<defs>
								<linearGradient id={"created"} x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor={"var(--color-sky-500)"} stopOpacity={0.8} />
									<stop offset="95%" stopColor={"var(--color-sky-500)"} stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id={"attended"} x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor={"var(--color-rose-500)"} stopOpacity={0.8} />
									<stop offset="95%" stopColor={"var(--color-rose-500)"} stopOpacity={0.1} />
								</linearGradient>
							</defs>

							<Area
								type="monotone"
								name="Creadas"
								dataKey="created"
								stroke="var(--color-sky-500)"
								fill="url(#created)"
								activeDot={{ r: 6, strokeWidth: 2 }}
							/>
							<Area
								type="monotone"
								name="Atendidas"
								dataKey="attended"
								stroke="var(--color-rose-500)"
								fill="url(#attended)"
								activeDot={{ r: 6, strokeWidth: 2 }}
							/>
						</AreaChart>
					</ChartContainer>
				</div>
			</CardContent>
		</Card>
	)
}
