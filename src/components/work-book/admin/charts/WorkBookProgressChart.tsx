"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useWorkBookProgressChart } from "@/hooks/charts/use-work-book-progress-chart"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
	ChartConfig,
	ChartTooltip,
	ChartContainer,
	ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
	avgProgress: {
		label: "Progreso Promedio",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig

export function WorkBookProgressChart() {
	const { data, isLoading } = useWorkBookProgressChart()

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Progreso en el Tiempo</CardTitle>
				</CardHeader>
				<CardContent>
					<Skeleton className="h-[250px] w-full" />
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Progreso en el Tiempo</CardTitle>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<AreaChart data={data}>
						<CartesianGrid vertical={false} />
						<XAxis dataKey="week" tickLine={false} tickMargin={10} axisLine={false} />
						<YAxis
							tickFormatter={(value) => `${value}%`}
							tickLine={false}
							tickMargin={10}
							axisLine={false}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<Area
							type="monotone"
							dataKey="avgProgress"
							stroke="var(--color-progress)"
							fill="var(--color-progress-light)"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
