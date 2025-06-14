"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { useWorkBookEntriesChart } from "@/features/work-order/hooks/use-work-book-entries-chart"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import {
	ChartConfig,
	ChartTooltip,
	ChartContainer,
	ChartTooltipContent,
} from "@/shared/components/ui/chart"

const chartConfig = {
	dailyActivity: {
		label: "Actividad Diaria",
		color: "var(--chart-1)",
	},
	additionalActivity: {
		label: "Actividad Adicional",
		color: "var(--chart-2)",
	},
	inspection: {
		label: "Inspección OTC",
		color: "var(--chart-3)",
	},
} satisfies ChartConfig

export function WorkBookEntriesChart() {
	const { data, isLoading } = useWorkBookEntriesChart()

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Entradas por Tipo</CardTitle>
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
				<CardTitle>Entradas por Tipo</CardTitle>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<BarChart accessibilityLayer data={data}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="month"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
							tickFormatter={(value) => value.slice(0, 3)}
						/>
						<ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
						<Bar dataKey="dailyActivity" fill="var(--color-daily)" radius={4} />
						<Bar dataKey="additionalActivity" fill="var(--color-additional)" radius={4} />
						<Bar dataKey="inspection" fill="var(--color-inspection)" radius={4} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
