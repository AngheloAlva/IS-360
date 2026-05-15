"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ActivityIcon } from "lucide-react"
import { es } from "date-fns/locale"
import { useCallback } from "react"
import { format } from "date-fns"

import { useLockoutPermitFilters } from "../../hooks/use-lockout-permit-filters"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

interface LockoutPermitActivityChartProps {
	data: Array<{
		month: Date
		count: number
	}>
}

export default function LockoutPermitActivityChart({ data }: LockoutPermitActivityChartProps) {
	const formatData = data.map((item) => ({
		count: item.count,
		originalDate: item.month,
		date: format(new Date(item.month), "MMM yyyy", { locale: es }),
	}))

	const { filters, actions } = useLockoutPermitFilters()

	const handleChartClick = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(data: any) => {
			if (!data.activePayload) return

			const selectedDate = new Date(data.activePayload[0].payload.originalDate)
			const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
			const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)

			if (
				filters.dateRange?.from?.getTime() === startOfMonth.getTime() &&
				filters.dateRange?.to?.getTime() === endOfMonth.getTime()
			) {
				actions.setDateRange(null)
			} else {
				actions.setDateRange({ from: startOfMonth, to: endOfMonth })
			}
		},
		[filters, actions]
	)

	return (
		<Card className="border-none transition-shadow hover:shadow-md">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-lg font-semibold">
							Actividad de Permisos de Bloqueo
						</CardTitle>
						<CardDescription>Permisos creados en los últimos 6 meses</CardDescription>
					</div>
					<ActivityIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<ChartContainer
					config={{
						count: {
							label: "Permisos",
							color: "hsl(221, 83%, 53%)", // blue-600
						},
					}}
					className="h-[250px] w-full max-w-[90dvw]"
				>
					<AreaChart
						data={formatData}
						onClick={handleChartClick}
						margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis dataKey="date" />
						<YAxis />
						<ChartTooltip content={<ChartTooltipContent nameKey="date" />} />
						<Area
							dataKey="count"
							type="monotone"
							fill="hsl(221, 83%, 53%)"
							fillOpacity={0.4}
							stroke="hsl(221, 83%, 53%)"
							strokeWidth={2}
							className="cursor-pointer transition-opacity hover:opacity-80"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
