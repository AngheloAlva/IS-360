"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ActivityIcon } from "lucide-react"
import { useCallback } from "react"
import { format } from "date-fns"

import { useWorkPermitFilters } from "../../hooks/use-work-permit-filters"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart"
import {
	Card,
	CardTitle,
	CardHeader,
	CardContent,
	CardDescription,
} from "@/shared/components/ui/card"

interface WorkPermitActivityChartProps {
	data: {
		date: string
		count: number
	}[]
}

export default function WorkPermitActivityChart({ data }: WorkPermitActivityChartProps) {
	const formatData = data.map((item) => ({
		count: item.count,
		originalDate: item.date,
		date: format(item.date, "dd-MM"),
	}))

	const { filters, actions } = useWorkPermitFilters()

	const handleChartClick = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(data: any) => {
			if (!data.activePayload) return

			const selectedDate = new Date(data.activePayload[0].payload.originalDate)

			if (selectedDate === filters.date) {
				actions.setDate(null)
			} else {
				actions.setDate(selectedDate)
			}
		},
		[filters, actions]
	)

	return (
		<Card className="border-none transition-shadow hover:shadow-md">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-lg font-semibold">Actividad de Permisos</CardTitle>
						<CardDescription>Permisos creados en los últimos 30 días</CardDescription>
					</div>
					<ActivityIcon className="text-muted-foreground mt-0.5 h-5 min-w-5" />
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<ChartContainer
					config={{
						count: {
							label: "Permisos",
							color: "var(--color-rose-500)",
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
							fill="var(--color-rose-500)"
							fillOpacity={0.4}
							stroke="var(--color-rose-500)"
							strokeWidth={2}
							className="cursor-pointer transition-opacity hover:opacity-80"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
