"use client"

import { Label, Pie, PieChart } from "recharts"

import { useWorkBookStatusChart } from "@/hooks/charts/use-work-book-status-chart"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
	ChartConfig,
	ChartTooltip,
	ChartContainer,
	ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
	PENDING: {
		label: "Pendiente",
		color: "var(--chart-1)",
	},
	IN_PROGRESS: {
		label: "En Progreso",
		color: "var(--chart-2)",
	},
	COMPLETED: {
		label: "Completado",
		color: "var(--chart-3)",
	},
	CANCELLED: {
		label: "Cancelado",
		color: "var(--chart-4)",
	},
} satisfies ChartConfig

export function WorkBookStatusChart() {
	const { data, isLoading } = useWorkBookStatusChart()

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Estado de Libros de Obra</CardTitle>
				</CardHeader>
				<CardContent>
					<Skeleton className="h-[250px] w-full" />
				</CardContent>
			</Card>
		)
	}

	const total = data?.reduce((acc, curr) => acc + curr.count, 0) || 0

	return (
		<Card>
			<CardHeader>
				<CardTitle>Estado de Libros de Obra</CardTitle>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
					<PieChart>
						<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
						<Pie data={data} dataKey="count" nameKey="status" innerRadius={60} strokeWidth={5}>
							<Label
								content={({ viewBox }) => {
									if (viewBox && "cx" in viewBox && "cy" in viewBox) {
										return (
											<text
												x={viewBox.cx}
												y={viewBox.cy}
												textAnchor="middle"
												dominantBaseline="middle"
											>
												<tspan
													x={viewBox.cx}
													y={viewBox.cy}
													className="fill-foreground text-3xl font-bold"
												>
													{total}
												</tspan>
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy || 0) + 24}
													className="fill-muted-foreground"
												>
													Total
												</tspan>
											</text>
										)
									}
									return null
								}}
							/>
						</Pie>
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
