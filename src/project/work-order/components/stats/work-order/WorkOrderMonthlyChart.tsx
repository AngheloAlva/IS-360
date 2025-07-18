"use client"

import { XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts"
import { ChartSplineIcon } from "lucide-react"
import { useCallback } from "react"

import { useWorkOrderFilters } from "@/project/work-order/hooks/use-work-order-filters"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

import type { WorkOrderStatsResponse } from "@/project/work-order/hooks/use-work-order-stats"

interface WorkOrderMonthlyChartProps {
	data: {
		monthly: WorkOrderStatsResponse["charts"]["monthly"]
	}
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
	const { filters, actions } = useWorkOrderFilters()

	const monthlyData = Array.from({ length: 12 }, (_, index) => {
		const monthNumber = index + 1
		const foundMonth = data.monthly.find((item) => item.month === monthNumber)

		return {
			month: monthNumber,
			name: MONTH_NAMES[index],
			count: foundMonth ? foundMonth.count : 0,
		}
	})

	const handleChartClick = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(data: any) => {
			if (data && data.activePayload && data.activePayload.length > 0) {
				const clickedData = data.activePayload[0].payload
				const monthNumber = clickedData.month

				if (monthNumber) {
					const currentYear = new Date().getFullYear()

					const firstDay = new Date(currentYear, monthNumber - 1, 1)
					const lastDay = new Date(currentYear, monthNumber, 0)

					const isMonthAlreadyFiltered =
						filters.dateRange &&
						filters.dateRange.from &&
						filters.dateRange.to &&
						filters.dateRange.from.getMonth() === firstDay.getMonth() &&
						filters.dateRange.from.getFullYear() === firstDay.getFullYear() &&
						filters.dateRange.to.getMonth() === lastDay.getMonth() &&
						filters.dateRange.to.getFullYear() === lastDay.getFullYear()

					if (isMonthAlreadyFiltered) {
						actions.setDateRange(null)
						console.log("Filtro de mes eliminado")
					} else {
						const dateRange = {
							from: firstDay,
							to: lastDay,
						}
						actions.setDateRange(dateRange)
						console.log("Filtro aplicado:", dateRange)

						setTimeout(() => {
							const tableElement = document.getElementById("work-order-table")
							if (tableElement) {
								tableElement.scrollIntoView({
									behavior: "smooth",
									block: "start",
								})
							}
						}, 100)
					}
				}
			}
		},
		[actions, filters.dateRange]
	)

	return (
		<Card className="cursor-pointer border-none transition-shadow hover:shadow-md">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-lg font-semibold">Tendencia Mensual de Órdenes</CardTitle>
						<CardDescription>
							Órdenes de Trabajo creadas en el año actual • Haz clic para filtrar/quitar filtro
						</CardDescription>
					</div>
					<ChartSplineIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<ChartContainer className="h-[250px] w-full max-w-[90dvw]" config={{}}>
					<AreaChart
						data={monthlyData}
						margin={{ top: 10, right: 20, left: 0 }}
						onClick={handleChartClick}
					>
						<ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis dataKey="name" />
						<YAxis tickFormatter={(value) => (value === 0 ? "0" : `${value}`)} />

						<defs>
							<linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="var(--color-orange-500)" stopOpacity={0.8} />
								<stop offset="95%" stopColor="var(--color-orange-500)" stopOpacity={0.1} />
							</linearGradient>
						</defs>

						<Area
							type="monotone"
							dataKey="count"
							stroke="var(--color-orange-500)"
							strokeWidth={2}
							fillOpacity={1}
							fill="url(#colorCount)"
							name="Órdenes"
							className="cursor-pointer transition-opacity hover:opacity-80"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
